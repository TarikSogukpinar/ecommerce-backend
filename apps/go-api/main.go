package main

import (
	"encoding/json"
	"go-api/config"
	"go-api/database"
	"go-api/middleware"
	"go-api/routes"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/streadway/amqp"
)

type TokenPayload struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Email        string `json:"email"`
}

type Message struct {
	Result TokenPayload `json:"result"`
}

func main() {
	config.LoadConfig()

	app := fiber.New(fiber.Config{
		AppName: "Mock Store API v.1.0",
	})

	app.Use(compress.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://mock-store.tariksogukpinar.dev, https://mock-api.tariksogukpinar.dev",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	database.ConnectDB()

	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 30 * time.Second,
	}))

	app.Use(helmet.New())

	app.Use(healthcheck.New())

	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path}\n",
		TimeFormat: "02-Jan-2006",
		TimeZone:   "Local",
	}))

	routes.SetupRoutes(app)

	app.Get("/metrics", monitor.New(monitor.Config{Title: "Mock API Monitoring"}))

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
		port = "3011"
	}
	log.Fatal(app.Listen("0.0.0.0:3011"))
}

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

			var message Message
			err := json.Unmarshal(d.Body, &message)
			if err != nil {
				log.Printf("Message parsing error: %s", err)
				continue
			}

			payload := message.Result

			log.Printf("Message content: %+v", payload)

			log.Println("Access token:", payload.AccessToken)

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
