package controller

import (
	"fmt"
	"go-api/database"
	"go-api/middleware"
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
