package routes

import (
	controller "go-api/controller/product"
	"go-api/database"
	services "go-api/services/product"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	productService := services.NewProductService(database.DB)
	productController := controller.NewProductController(productService)

	api := app.Group("/api/v1")

	productRoutes := api.Group("/products")
	productRoutes.Get("/", productController.GetAllProducts)
	productRoutes.Post("/", productController.CreateProduct)
	productRoutes.Get("/:id", productController.GetProductByID)
	productRoutes.Put("/:id", productController.UpdateProduct)
	productRoutes.Delete("/:id", productController.DeleteProduct)
}
