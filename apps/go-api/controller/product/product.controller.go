package controller

import (
	services "go-api/services/product"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// Product represents a product in the system
// type Product struct {
// 	gorm.Model
// 	ID    uint   `json:"id" gorm:"primaryKey"`
// 	Name  string `json:"name"`
// 	Price string `json:"price"`
// }

type ProductController struct {
	ProductService services.ProductService
}

func NewProductController(productService services.ProductService) *ProductController {
	return &ProductController{
		ProductService: productService,
	}
}

// GetAllProducts gets all products
func (pc *ProductController) GetAllProducts(c *fiber.Ctx) error {
	products, err := pc.ProductService.GetAllProducts()
	if err != nil {
		log.Println("Error fetching products:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch products",
		})
	}
	return c.Status(http.StatusOK).JSON(products)
}

// GetProductByID gets a product by its ID
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

// CreateProduct creates a new product
func (pc *ProductController) CreateProduct(c *fiber.Ctx) error {
	var input services.ProductCreateInput

	if err := c.BodyParser(&input); err != nil {
		log.Println("Invalid request body:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	product, err := pc.ProductService.CreateProduct(input)
	if err != nil {
		log.Println("Error creating product:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create product",
		})
	}

	return c.Status(http.StatusCreated).JSON(product)
}

// UpdateProduct updates an existing product by ID
func (pc *ProductController) UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var input services.ProductUpdateInput

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

// DeleteProduct deletes a product by ID
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

// func ProductsHandler(c *fiber.Ctx) error {
// 	authHeader := c.Get("Authorization")
// 	if authHeader == "" {
// 		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
// 			"error": "Authorization header required",
// 		})
// 	}

// 	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

// 	// Validate token using middleware function
// 	claims, err := middleware.ValidateToken(tokenString)
// 	if err != nil {
// 		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
// 			"error": "Invalid token: " + err.Error(),
// 		})
// 	}

// 	fmt.Println("User ID:", claims["id"])

// 	// Query products from CockroachDB
// 	var products []Product
// 	if err := database.DB.Find(&products).Error; err != nil {
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not fetch products",
// 		})
// 	}

// 	// Return the queried products as a JSON response
// 	return c.JSON(products)
// }

// func CreateProduct(c *fiber.Ctx) error {
// 	product := new(Product)

// 	body := c.Body()
// 	log.Println("Received Body:", string(body))

// 	if err := c.BodyParser(product); err != nil {
// 		log.Println("BodyParser Error:", err)
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 			"error": "Invalid request body",
// 		})
// 	}

// 	if err := database.DB.Create(&product).Error; err != nil {
// 		log.Println("Database Error:", err)
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not create product",
// 		})
// 	}

// 	return c.Status(http.StatusCreated).JSON(product)
// }

// func GetAllProducts(c *fiber.Ctx) error {
// 	var products []Product
// 	if err := database.DB.Find(&products).Error; err != nil {
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not fetch products",
// 		})
// 	}

// 	return c.JSON(products)
// }

// func GetProductByID(c *fiber.Ctx) error {
// 	id := c.Params("id")

// 	var product Product
// 	if err := database.DB.First(&product, id).Error; err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			return c.Status(http.StatusNotFound).JSON(fiber.Map{
// 				"error": "Product not found",
// 			})
// 		}
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not fetch product",
// 		})
// 	}

// 	return c.JSON(product)
// }

// func UpdateProduct(c *fiber.Ctx) error {
// 	id := c.Params("id")

// 	var product Product
// 	if err := database.DB.First(&product, id).Error; err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			return c.Status(http.StatusNotFound).JSON(fiber.Map{
// 				"error": "Product not found",
// 			})
// 		}
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not fetch product",
// 		})
// 	}

// 	if err := c.BodyParser(&product); err != nil {
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 			"error": "Invalid request body",
// 		})
// 	}

// 	if err := database.DB.Save(&product).Error; err != nil {
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not update product",
// 		})
// 	}

// 	return c.JSON(product)
// }

// func DeleteProduct(c *fiber.Ctx) error {

// 	id := c.Params("id")

// 	if err := database.DB.Delete(&Product{}, id).Error; err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			return c.Status(http.StatusNotFound).JSON(fiber.Map{
// 				"error": "Product not found",
// 			})
// 		}
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": "Could not delete product",
// 		})
// 	}

// 	return c.SendStatus(http.StatusNoContent)
// }
