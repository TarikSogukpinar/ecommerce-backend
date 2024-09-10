package controller

import (
	"fmt"
	"go-api/database"
	"go-api/middleware"
	"log"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// Product represents a product in the system
type Product struct {
	gorm.Model
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Price string `json:"price"`
}

func ProductsHandler(c *fiber.Ctx) error {
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

	// Query products from CockroachDB
	var products []Product
	if err := database.DB.Find(&products).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch products",
		})
	}

	// Return the queried products as a JSON response
	return c.JSON(products)
}

func CreateProduct(c *fiber.Ctx) error {
	product := new(Product)

	// Gelen isteği loglayın
	body := c.Body()
	log.Println("Received Body:", string(body)) // Gelen body'yi loglar

	// JSON verisini parse edin
	if err := c.BodyParser(product); err != nil {
		log.Println("BodyParser Error:", err) // Parse hatasını loglar
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Ürünü veritabanına kaydet
	if err := database.DB.Create(&product).Error; err != nil {
		log.Println("Database Error:", err) // Veritabanı hatasını loglar
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create product",
		})
	}

	// Yeni ürünü döndür
	return c.Status(http.StatusCreated).JSON(product)
}

func GetAllProducts(c *fiber.Ctx) error {
	var products []Product
	if err := database.DB.Find(&products).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch products",
		})
	}

	return c.JSON(products)
}

func GetProductByID(c *fiber.Ctx) error {
	// Parametreden ID'yi al
	id := c.Params("id")

	// Ürünü veritabanından çek
	var product Product
	if err := database.DB.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Product not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch product",
		})
	}

	// Ürünü döndür
	return c.JSON(product)
}

func UpdateProduct(c *fiber.Ctx) error {
	// Parametreden ID'yi al
	id := c.Params("id")

	// Güncellenecek ürünü veritabanından çek
	var product Product
	if err := database.DB.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Product not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch product",
		})
	}

	// Gelen JSON verisini ürüne dönüştür
	if err := c.BodyParser(&product); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Ürünü güncelle
	if err := database.DB.Save(&product).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not update product",
		})
	}

	// Güncellenmiş ürünü döndür
	return c.JSON(product)
}

func DeleteProduct(c *fiber.Ctx) error {
	// Parametreden ID'yi al
	id := c.Params("id")

	// Ürünü veritabanından sil
	if err := database.DB.Delete(&Product{}, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Product not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not delete product",
		})
	}

	// Başarılı silme durumunu döndür
	return c.SendStatus(http.StatusNoContent)
}
