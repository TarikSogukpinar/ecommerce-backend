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

// GetAllCategories godoc
// @Summary      Get all categories
// @Description  Fetch all categories
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Success      200  {array}  models.Category
// @Router       /categories [get]
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

// CreateCategory godoc
// @Summary      Create a new category
// @Description  Create a new category in the system
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Param        category  body      models.Category  true  "Category body"
// @Success      201  {object}  models.Category
// @Failure      400  {object}  map[string]string
// @Router       /categories [post]
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

// GetCategoryByID godoc
// @Summary      Get category by ID
// @Description  Fetch category details by ID
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Category ID"
// @Success      200  {object}  models.Category
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /categories/{id} [get]
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

// DeleteCategory godoc
// @Summary      Delete a category
// @Description  Remove a category by ID
// @Tags         Categories
// @Param        id   path      int  true  "Category ID"
// @Success      204  "No Content"
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /categories/{id} [delete]
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

// GetProductsByCategory godoc
// @Summary      Get products by category
// @Description  Returns all products for a given category
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        categoryId path string true "Category ID"
// @Success      200  {array}  models.Product
// @Failure      404  {object} map[string]string
// @Router       /products/category/{categoryId} [get]
func (cc *CategoryController) GetProductsByCategory(c *fiber.Ctx) error {
	categoryId := c.Params("categoryId")

	products, err := cc.CategoryService.GetProductsByCategory(categoryId)
	if err != nil {
		log.Println("Error fetching products by category:", err)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "No products found for the given category",
		})
	}

	return c.JSON(products)
}
