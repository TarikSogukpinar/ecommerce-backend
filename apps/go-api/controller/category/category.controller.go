package controller

import (
	"go-api/models"
	services "go-api/services/category"
	"log"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type CategoryController struct {
	CategoryService *services.CategoryService
}

func NewCategoryController(categoryService *services.CategoryService) *CategoryController {
	return &CategoryController{
		CategoryService: categoryService,
	}
}

func (cc *CategoryController) GetAllCategories(c *fiber.Ctx) error {
	categories, err := cc.CategoryService.GetAllCategories()
	if err != nil {
		log.Println("Error fetching categories:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not fetch categories",
		})
	}
	return c.Status(http.StatusOK).JSON(categories)
}

func (cc *CategoryController) CreateCategory(c *fiber.Ctx) error {
	var category models.Category

	if err := c.BodyParser(&category); err != nil {
		log.Println("Invalid request body:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	newCategory, err := cc.CategoryService.CreateCategory(category)
	if err != nil {
		log.Println("Error creating category:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create category",
		})
	}

	return c.Status(http.StatusCreated).JSON(newCategory)
}

func (cc *CategoryController) GetCategoryByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	category, err := cc.CategoryService.GetCategoryByID(uint(id))
	if err != nil {
		log.Println("Error fetching category:", err)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	return c.Status(http.StatusOK).JSON(category)
}

func (cc *CategoryController) DeleteCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	if err := cc.CategoryService.DeleteCategory(uint(id)); err != nil {
		log.Println("Error deleting category:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not delete category",
		})
	}

	return c.SendStatus(http.StatusNoContent)
}
