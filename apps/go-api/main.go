package main

import (
	"go-api/config"
	"go-api/database"
	"go-api/rabbitmq"
	"go-api/routes"
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

	rabbitMQURL := config.Get("RABBITMQ_URL")
	rabbitMQQueue := config.Get("RABBITMQ_QUEUE")

	rabbitMQService, err := rabbitmq.NewRabbitMQService(rabbitMQURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %s", err)
	}
	defer rabbitMQService.Close()

	err = rabbitMQService.ConsumeMessages(rabbitMQQueue, func(d amqp.Delivery) {
		log.Printf("Received a message: %s", d.Body)

	})
	if err != nil {
		log.Fatalf("Failed to start consuming messages: %s", err)
	}

	// Rotayı ayarlayın
	routes.SetupRoutes(app, database.DB, rabbitMQService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "6060"
	}

	log.Fatal(app.Listen(":" + port))
}
