package main

import (
	"encoding/json"
	"go-api/config"
	"go-api/controller"
	"go-api/database"
	middleware "go-api/middleware"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/streadway/amqp"
)

type TokenPayload struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Email        string `json:"email"`
}

func main() {
	// Load configuration and initialize environment variables
	config.LoadConfig()
	// jwtSecret = []byte(os.Getenv("JWT_SECRET"))

	// Create Fiber app instance
	app := fiber.New()

	// Connect to the database
	database.ConnectDB()

	// Middleware for rate-limiting requests
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 30 * time.Second,
	}))

	// Middleware for security headers
	app.Use(helmet.New())

	// Middleware for enabling CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:6060, http://localhost:7070",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE",
		AllowCredentials: true,
	}))

	// Middleware for logging requests
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path}\n",
		TimeFormat: "02-Jan-2006",
		TimeZone:   "Local",
	}))

	// Register routes: handle products
	app.Get("/api/products", controller.ProductsHandler)
	app.Post("/api/products", controller.CreateProduct)

	// RabbitMQ connection
	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	// RabbitMQ channel creation
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("RabbitMQ channel error: %v", err)
	}
	defer ch.Close()

	// Start consuming messages from RabbitMQ
	go consumeMessages(ch)

	// Start Fiber app
	port := os.Getenv("PORT")
	if port == "" {
		port = "6060"
	}
	log.Fatal(app.Listen(":" + port))
}

// Consume messages from RabbitMQ
func consumeMessages(ch *amqp.Channel) {
	msgs, err := ch.Consume(
		"token_created_queue",
		"",
		true,  // Auto-acknowledge
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

			log.Println("Access token...", payload.AccessToken)

			claims, err := middleware.ValidateToken(payload.AccessToken)
			if err != nil {
				log.Println("Invalid token:", err)
				continue
			}

			log.Printf("Token is valid, user: %v", claims["id"])

		}
	}()

	<-forever
}
