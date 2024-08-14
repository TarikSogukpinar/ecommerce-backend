package routes

import (
	"go-api/controllers"
	"go-api/middlewares"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("GoLang & Next.js!")
	})

	// Auth routes
	api := app.Group("/api")
	auth := api.Group("/auth")
	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)

	// Protected routes (requires authentication)
	protected := api.Group("/protected")
	protected.Use(middlewares.AuthRequired())

	// Book routes (requires authentication)
	products := api.Group("/products")
	products.Use(middlewares.AuthRequired()) // Applying Auth middleware to book routes

}
