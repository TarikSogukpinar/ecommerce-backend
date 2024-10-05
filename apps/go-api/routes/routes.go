package routes

import (
	categoryController "go-api/controller/category"
	productController "go-api/controller/product"
	"go-api/database"
	categoryService "go-api/services/category"
	productService "go-api/services/product"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	db := database.DB

	prodService := productService.NewProductService(db)
	catService := categoryService.NewCategoryService(db)
	prodController := productController.NewProductController(prodService, *catService, db)

	catController := categoryController.NewCategoryController(catService)

	api := app.Group("/api/v1")

	productRoutes := api.Group("/products")
	productRoutes.Get("/price", prodController.GetProductsByPriceRange)
	productRoutes.Patch("/bulk-update", prodController.BulkUpdatePrices)
	productRoutes.Patch("/:id/stock", prodController.UpdateProductStock)
	productRoutes.Get("/", prodController.GetAllProducts)
	productRoutes.Post("/", prodController.CreateProduct)
	productRoutes.Get("/:id", prodController.GetProductByID)
	productRoutes.Put("/:id", prodController.UpdateProduct)
	productRoutes.Delete("/:id", prodController.DeleteProduct)

	categoryRoutes := api.Group("/categories")
	categoryRoutes.Get("/:categoryId", catController.GetProductsByCategory)
	categoryRoutes.Get("/", catController.GetAllCategories)
	categoryRoutes.Post("/", catController.CreateCategory)
	categoryRoutes.Get("/:id", catController.GetCategoryByID)
	categoryRoutes.Delete("/:id", catController.DeleteCategory)
}
