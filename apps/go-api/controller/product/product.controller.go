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

	// Validate token using middleware function
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
// @Router       /products [post]
func (pc *ProductController) GetProductByID(c *fiber.Ctx) error {
	id := c.Params("id")

	product, err := pc.ProductService.GetProductByID(id)
	if err != nil {
		log.Println("Error fetching product:", err)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(http.StatusOK).JSON(product)
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

	// Check if category exists
	category, err := pc.CategoryService.GetCategoryByID(input.CategoryID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	// Proceed with product creation
	product := models.Product{
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

	return c.SendStatus(http.StatusNoContent)
}

// GetNewProducts godoc
// @Summary      Get new products
// @Description  Returns newly added products
// @Tags         Products
// @Accept       json
// @Produce      json
// @Success      200  {array}  models.Product
// @Router       /products/new [get]
func (pc *ProductController) GetNewProducts(c *fiber.Ctx) error {
	products, err := pc.ProductService.GetNewProducts()
	if err != nil {
		log.Println("Error fetching new products:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch new products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}

// FilterProductsByPrice godoc
// @Summary      Filter products by price range
// @Description  Filters products by minimum and maximum price
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        minPrice  query   number  true  "Minimum Price"
// @Param        maxPrice  query   number  true  "Maximum Price"
// @Success      200  {array}  models.Product
// @Router       /products/filter-by-price [get]
func (pc *ProductController) FilterProductsByPrice(c *fiber.Ctx) error {
	minPrice, err := strconv.ParseFloat(c.Query("minPrice"), 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid minPrice",
		})
	}
	maxPrice, err := strconv.ParseFloat(c.Query("maxPrice"), 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid maxPrice",
		})
	}

	products, err := pc.ProductService.FilterProductsByPrice(minPrice, maxPrice)
	if err != nil {
		log.Println("Error fetching products by price:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}

// GetLowStockProducts godoc
// @Summary      Get low stock products
// @Description  Returns products with stock below a specified threshold
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        stockThreshold  query   int  true  "Stock Threshold"
// @Success      200  {array}  models.Product
// @Router       /products/low-stock [get]
func (pc *ProductController) GetLowStockProducts(c *fiber.Ctx) error {
	threshold, err := strconv.Atoi(c.Query("stockThreshold"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid stock threshold",
		})
	}

	products, err := pc.ProductService.GetLowStockProducts(threshold)
	if err != nil {
		log.Println("Error fetching low stock products:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch low stock products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}

// GetDiscountedProducts godoc
// @Summary      Get discounted products
// @Description  Returns products that are discounted
// @Tags         Products
// @Accept       json
// @Produce      json
// @Success      200  {array}  models.Product
// @Router       /products/discounted [get]
func (pc *ProductController) GetDiscountedProducts(c *fiber.Ctx) error {
	products, err := pc.ProductService.GetDiscountedProducts()
	if err != nil {
		log.Println("Error fetching discounted products:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch discounted products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}
