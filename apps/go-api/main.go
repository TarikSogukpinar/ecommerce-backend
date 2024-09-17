package main

import (
	"fmt"
	"go-api/config"
	"go-api/core/rabbitmq"
	"go-api/database"
	"go-api/routes"
	"log"
	"os"
	"time"

	_ "go-api/docs"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/gofiber/swagger"
)

type TokenPayload struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Email        string `json:"email"`
}

type Message struct {
	Result TokenPayload `json:"result"`
}

// @title Mock-API Swagger Example API
// @version 1.0
// @description This is a sample server for a Fiber application.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:3011
// @BasePath /
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

	app.Get("/swagger/*", swagger.HandlerDefault)

	conn, ch, err := rabbitmq.InitializeRabbitMQ()
	if err != nil {
		log.Fatalf("Failed to initialize RabbitMQ: %v", err)
	}
	defer rabbitmq.CloseRabbitMQ()

	fmt.Println("RabbitMQ connection established", conn)

	go rabbitmq.ConsumeMessages(ch)

	port := os.Getenv("PORT")
	if port == "" {
		port = "0.0.0.0:3011"
	}

	log.Fatal(app.Listen(port))
}
