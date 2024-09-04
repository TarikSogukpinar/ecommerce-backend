package main

import (
	"encoding/json"
	"fmt"
	"go-api/config"
	"go-api/database"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/golang-jwt/jwt/v4"
	"github.com/streadway/amqp"
)

type TokenPayload struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Email        string `json:"email"`
}

type Product struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Price string `json:"price"`
}

// Fake ürün listesi
var products = []Product{
	{ID: 1, Name: "Product A", Price: "$10"},
	{ID: 2, Name: "Product B", Price: "$20"},
	{ID: 3, Name: "Product C", Price: "$30"},
}

// JWT doğrulama secret key (NestJS ile aynı olmalı)
var jwtSecret = []byte("6583e4685e27a7cc1d977ab5f69a2dc7d10667aef4f0daa890da2473a4487b8cdbd179db194362a929f460e6fb47cb4b5c7a761cee2035129348145a2f653d9f")

func main() {

	config.LoadConfig()

	app := fiber.New()

	database.ConnectDB()

	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 30 * time.Second,
	}))

	app.Use(helmet.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:6060, http://localhost:7070",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE",
		AllowCredentials: true,
	}))

	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path}\n",
		TimeFormat: "02-Jan-2006",
		TimeZone:   "Local",
	}))

	// Ürünleri döndüren API route'u
	app.Get("/api/products", productsHandler)

	conn, err := amqp.Dial("amqp://ledun:testledun2216@78.111.111.77:5672")
	if err != nil {
		log.Fatalf("RabbitMQ'ya bağlanılamadı: %v", err)
	}
	defer conn.Close()

	// RabbitMQ kanalını oluştur
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("RabbitMQ kanal hatası: %v", err)
	}
	defer ch.Close()

	go consumeMessages(ch)

	port := os.Getenv("PORT")
	if port == "" {
		port = "6060"
	}

	log.Fatal(app.Listen(":" + port))
}

// Ürünleri döndüren API handler
func productsHandler(c *fiber.Ctx) error {
	// Authorization başlığından token'ı al
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header gerekli",
		})
	}

	// Bearer token'ı ayrıştır
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Token'ı doğrula
	claims, err := validateToken(tokenString)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Geçersiz token: " + err.Error(),
		})
	}

	// Token geçerliyse ürünleri döndür
	log.Printf("Token geçerli, kullanıcı: %v", claims["id"])
	return c.JSON(products)
}

// RabbitMQ mesajlarını dinle
func consumeMessages(ch *amqp.Channel) {
	// RabbitMQ kuyruğundan mesajları tüket
	msgs, err := ch.Consume(
		"token_created_queue", // Kuyruk adı
		"",                    // Consumer adı, boş ise RabbitMQ random bir ad verir
		true,                  // Auto-ack (otomatik olarak mesajları onayla)
		false,                 // Exclusive
		false,                 // No-local
		false,                 // No-wait
		nil,                   // Arguments
	)
	if err != nil {
		log.Fatalf("Kuyruk mesajları alınamadı: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Gelen mesaj: %s", d.Body)

			var payload TokenPayload
			err := json.Unmarshal(d.Body, &payload)
			if err != nil {
				log.Printf("Mesaj ayrıştırma hatası: %s", err)
				continue
			}

			log.Printf("Mesaj içeriği: %v", payload)

			// Token doğrulama işlemi
			claims, err := validateToken(payload.AccessToken)
			if err != nil {
				log.Println("Token geçersiz:", err)
				continue
			}

			log.Printf("Token geçerli, kullanıcı: %v", claims["id"])

			// Ürünleri işleme
			for _, product := range products {
				processProduct(product)
			}
		}
	}()

	log.Printf(" [*] RabbitMQ'dan mesajlar dinleniyor. Çıkmak için CTRL+C'ye basın.")
	<-forever
}

// Token doğrulama işlemi
func validateToken(tokenString string) (jwt.MapClaims, error) {
	// Token'ı parse et ve doğrula
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Token'dan claim'leri al
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, fmt.Errorf("token geçersiz")
	}
}

// Ürün işleme fonksiyonu
func processProduct(product Product) {
	fmt.Printf("Ürün işlendi: %s - %s\n", product.Name, product.Price)
}
