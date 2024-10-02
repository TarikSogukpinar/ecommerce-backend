package services

import (
	"go-api/models"

	"gorm.io/gorm"
)

type CategoryService struct {
	DB *gorm.DB
}

func NewCategoryService(db *gorm.DB) *CategoryService {
	return &CategoryService{
		DB: db,
	}
}

func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := s.DB.Find(&categories).Error
	return categories, err
}

func (s *CategoryService) CreateCategory(category models.Category) (models.Category, error) {
	err := s.DB.Create(&category).Error
	return category, err
}

func (s *CategoryService) GetCategoryByID(id uint) (*models.Category, error) {
	var category models.Category
	err := s.DB.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (s *CategoryService) DeleteCategory(id uint) error {
	return s.DB.Delete(&models.Category{}, id).Error
}

func (s *CategoryService) GetProductsByCategory(categoryId string) ([]models.Product, error) {
	var products []models.Product

	// Belirtilen kategoriye ait ürünleri sorguluyoruz
	if err := s.DB.Where("category_id = ?", categoryId).Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil
}
