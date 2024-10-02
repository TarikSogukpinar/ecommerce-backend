package routes

import (
	categoryController "go-api/controller/category" // Category controller import
	productController "go-api/controller/product"   // Product controller import
	"go-api/database"
	categoryService "go-api/services/category" // Category service import with alias
	productService "go-api/services/product"   // Product service import with alias

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Database connection
	db := database.DB

	// Product setup
	prodService := productService.NewProductService(db)  // Product service
	catService := categoryService.NewCategoryService(db) // Category service
	prodController := productController.NewProductController(prodService, *catService, db)

	// Category setup
	catController := categoryController.NewCategoryController(catService)

	api := app.Group("/api/v1")

	// Product routes
	productRoutes := api.Group("/products")
	productRoutes.Get("/price", prodController.GetProductsByPriceRange)
	productRoutes.Patch("/bulk-update", prodController.BulkUpdatePrices)
	productRoutes.Patch("/:id/stock", prodController.UpdateProductStock)
	productRoutes.Get("/", prodController.GetAllProducts)
	productRoutes.Post("/", prodController.CreateProduct)
	productRoutes.Get("/:id", prodController.GetProductByID)
	productRoutes.Put("/:id", prodController.UpdateProduct)
	productRoutes.Delete("/:id", prodController.DeleteProduct)

	// Category routes
	categoryRoutes := api.Group("/categories")
	categoryRoutes.Get("/:categoryId", catController.GetProductsByCategory)
	categoryRoutes.Get("/", catController.GetAllCategories)
	categoryRoutes.Post("/", catController.CreateCategory)
	categoryRoutes.Get("/:id", catController.GetCategoryByID)
	categoryRoutes.Delete("/:id", catController.DeleteCategory)
}
