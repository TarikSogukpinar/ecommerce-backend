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

// Fake products list this methods come from database
var products = []Product{
	{ID: 1, Name: "Product A", Price: "$10"},
	{ID: 2, Name: "Product B", Price: "$20"},
	{ID: 3, Name: "Product C", Price: "$30"},
}

var jwtSecret []byte

func main() {

	config.LoadConfig()

	jwtSecret = []byte(os.Getenv("JWT_SECRET"))

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

	// Return fake prdocuts
	app.Get("/api/products", productsHandler)

	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("RabbitMQ channel error: %v", err)
	}
	defer ch.Close()

	go consumeMessages(ch)

	port := os.Getenv("PORT")
	if port == "" {
		port = "6060"
	}

	log.Fatal(app.Listen(":" + port))
}

func productsHandler(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header required",
		})
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Validate token
	claims, err := validateToken(tokenString)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token: " + err.Error(),
		})
	}
	log.Printf("Token is valid, user: %v", claims["id"])
	return c.JSON(products)
}

func consumeMessages(ch *amqp.Channel) {
	msgs, err := ch.Consume(
		"token_created_queue",
		"",
		true,  // Auto-ack
		false, // Exclusive
		false, // No-local
		false, // No-wait
		nil,   // Arguments
	)
	if err != nil {
		log.Fatalf("Queue messages could not be received: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Incoming message: %s", d.Body)

			var payload TokenPayload
			err := json.Unmarshal(d.Body, &payload)
			if err != nil {
				log.Printf("Message parsing error: %s", err)
				continue
			}

			log.Printf("Message content: %v", payload)

			claims, err := validateToken(payload.AccessToken)
			if err != nil {
				log.Println("Invalid token:", err)
				continue
			}

			log.Printf("Token is valid, user: %v", claims["id"])

			for _, product := range products {
				processProduct(product)
			}
		}
	}()

	<-forever
}

func validateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, fmt.Errorf("invalid token")
	}
}

func processProduct(product Product) {
	fmt.Printf("Products: %s - %s\n", product.Name, product.Price)
}
