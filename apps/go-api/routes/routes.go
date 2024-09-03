package routes

import (
	"fmt"
	"go-api/controllers"
	"go-api/middlewares"
	"go-api/rabbitmq"
	"os"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, rabbitMQService *rabbitmq.RabbitMQService) {
	secretKey := os.Getenv("JWT_SECRET")

	fmt.Println(secretKey, "secretKey")

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("GoLang & Next.js!")
	})

	api := app.Group("/api")
	products := api.Group("/products")
	products.Use(middlewares.AuthRequired(secretKey, rabbitMQService))

	productController := controllers.NewProductController(db)
	products.Get("/", productController.GetProducts)
}
