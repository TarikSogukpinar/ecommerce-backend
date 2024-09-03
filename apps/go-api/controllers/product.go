package controllers

import (
	"go-api/models"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ProductController struct
type ProductController struct {
	DB *gorm.DB
}

func NewProductController(db *gorm.DB) *ProductController {
	return &ProductController{DB: db}
}

// GetProducts returns all products
func (p *ProductController) GetProducts(c *fiber.Ctx) error {
	var products []models.Product
	result := p.DB.Find(&products)
	println(result)
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}
	return c.JSON(products)
}
