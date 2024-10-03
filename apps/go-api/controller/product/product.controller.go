package controller

import (
	"fmt"
	"go-api/middleware"
	"go-api/models"
	categoryService "go-api/services/category"
	productService "go-api/services/product"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ProductController struct {
	ProductService  productService.ProductService
	CategoryService categoryService.CategoryService
	DB              *gorm.DB
}

func NewProductController(productService productService.ProductService, categoryService categoryService.CategoryService, db *gorm.DB) *ProductController {
	return &ProductController{
		ProductService:  productService,
		CategoryService: categoryService,
		DB:              db,
	}
}

// GetAllProducts godoc
// @Summary      GetAllProducts
// @Description  Returns all products
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string  true  "Bearer {token}"
// @Success      200  {array}   models.Product
// @Router       /products [get]
func (pc *ProductController) GetAllProducts(c *fiber.Ctx) error {

	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header required",
		})
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	claims, err := middleware.ValidateToken(tokenString)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token: " + err.Error(),
		})
	}

	fmt.Println("User ID:", claims["id"])

	products, err := pc.ProductService.GetAllProducts()

	if err != nil {
		log.Println("Error fetching products:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}

// GetProductByID godoc
// @Summary      GetProductByID
// @Description  Returns a product by ID
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string              true  "Bearer {token}"
// @Param        product        body      models.ProductCreateInput  true  "Ürün oluşturma verileri"
// @Success      201  {object}  models.Product
// @Router       /products [get]
func (pc *ProductController) GetProductByID(c *fiber.Ctx) error {

	id := c.Params("id")

	product, err := pc.ProductService.GetProductByID(id)
	if err != nil {

		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(product)
}

// CreateProduct godoc
// @Summary      CreateProduct
// @Description  Creates a new product with the given data
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string              true  "Bearer {token}"
// @Param        product        body      models.ProductCreateInput  true  "Ürün oluşturma verileri"
// @Success      201  {object}  models.Product
// @Router       /products [post]
func (pc *ProductController) CreateProduct(c *fiber.Ctx) error {
	var input models.ProductCreateInput

	if err := c.BodyParser(&input); err != nil {
		log.Println("Invalid request body:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category, err := pc.CategoryService.GetCategoryByID(input.CategoryID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	product := models.Product{
		ID:            input.ID,
		Name:          input.Name,
		Description:   input.Description,
		Price:         input.Price,
		Quantity:      input.Quantity,
		Image:         input.Image,
		CategoryID:    input.CategoryID,
		Category:      *category,
		DiscountPrice: input.DiscountPrice,
		IsActive:      input.IsActive,
		Stock:         input.Stock,
		SKU:           input.SKU,
	}

	if err := pc.DB.Create(&product).Error; err != nil {
		log.Println("Error creating product:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create product",
		})
	}

	return c.Status(http.StatusCreated).JSON(product)
}

// UpdateProduct godoc
// @Summary      Update a product
// @Description  Updates a product with the given data
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string                 true  "Bearer {token}"
// @Param        id             path      string                 true  "Ürün ID'si"
// @Param        product        body      models.ProductUpdateInput  true  "Ürün güncelleme verileri"
// @Success      200  {object}  models.Product
// @Router       /products/{id} [put]
func (pc *ProductController) UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var input models.ProductUpdateInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	product, err := pc.ProductService.UpdateProduct(id, input)
	if err != nil {
		log.Println("Error updating product:", err)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(http.StatusOK).JSON(product)
}

// DeleteProduct godoc
// @Summary      Delete a product
// @Description  Deletes a product with the given ID
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string  true  "Bearer {token}"
// @Param        id             path      string  true  "Ürün ID'si"
// @Success      204  "No Content"
// @Router       /products/{id} [delete]
func (pc *ProductController) DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := pc.ProductService.DeleteProduct(id); err != nil {
		log.Println("Error deleting product:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not delete product",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Product deleted successfully",
	})
}

// GetProductsByPriceRange godoc
// @Summary      Get products by price range
// @Description  Returns products within a specified price range, optionally sorted by price.
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        Authorization  header    string  true   "Bearer {token}"
// @Param        min_price       query     number  true   "Minimum price"
// @Param        max_price       query     number  true   "Maximum price"
// @Param        sort            query     string  false  "Sort order (asc or desc)"
// @Success      200  {array}    models.Product
// @Failure      400  {object}   map[string]string "Invalid request"
// @Failure      500  {object}   map[string]string "Failed to fetch products"
// @Router       /products/price-range [get]
func (pc *ProductController) GetProductsByPriceRange(c *fiber.Ctx) error {
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	sortOrder := c.Query("sort")

	if minPrice == "" || maxPrice == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Both min_price and max_price must be provided",
		})
	}

	min, err := strconv.ParseFloat(minPrice, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid min_price",
		})
	}

	max, err := strconv.ParseFloat(maxPrice, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid max_price",
		})
	}

	products, err := pc.ProductService.GetProductsByPriceRange(min, max, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch products",
		})
	}

	return c.JSON(products)
}

// UpdateProductStock godoc
// @Summary      Update product stock
// @Description  Updates the stock quantity of a product
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        id    path string true "Product ID"
// @Param        stock body int    true "New Stock Quantity"
// @Success      200  {object}  models.Product
// @Failure      404  {object}  map[string]string
// @Router       /products/{id}/stock [patch]
func (pc *ProductController) UpdateProductStock(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Stock int `json:"stock"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	product, err := pc.ProductService.UpdateProductStock(id, input.Stock)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.JSON(product)
}

// BulkUpdatePrices godoc
// @Summary      Bulk update product prices
// @Description  Updates prices for multiple products
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        prices body []models.ProductPriceUpdateInput true "Product prices to update"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string "Invalid request"
// @Failure      500  {object}  map[string]string "Could not update product prices"
// @Router       /products/bulk-update [patch]
func (pc *ProductController) BulkUpdatePrices(c *fiber.Ctx) error {
	var priceUpdates []models.ProductPriceUpdateInput

	if err := c.BodyParser(&priceUpdates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := pc.ProductService.BulkUpdatePrices(priceUpdates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{"message": "Product prices updated successfully"})
}

// SearchProducts godoc
// @Summary      Search products
// @Description  Search for products by name, description, and price range
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        query      query string  false "Search query"
// @Param        min_price  query number  false "Minimum price"
// @Param        max_price  query number  false "Maximum price"
// @Success      200  {array}  models.Product
// @Failure      500  {object}  map[string]string "Failed to search products"
// @Router       /products/search [get]
func (pc *ProductController) SearchProducts(c *fiber.Ctx) error {
	query := c.Query("query")
	minPriceStr := c.Query("min_price")
	maxPriceStr := c.Query("max_price")

	var minPrice, maxPrice float64
	var err error

	if minPriceStr != "" {
		minPrice, err = strconv.ParseFloat(minPriceStr, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid min_price",
			})
		}
	}

	if maxPriceStr != "" {
		maxPrice, err = strconv.ParseFloat(maxPriceStr, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid max_price",
			})
		}
	}

	products, err := pc.ProductService.SearchProducts(query, minPrice, maxPrice)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search products",
		})
	}

	return c.JSON(products)
}
