package services

import (
	"go-api/models"

	"gorm.io/gorm"
)

type ProductService interface {
	GetAllProducts() ([]models.Product, error)
	GetProductByID(id string) (models.Product, error)
	UpdateProduct(id string, input models.ProductUpdateInput) (models.Product, error)
	DeleteProduct(id string) error
	GetProductsByPriceRangeService(minPrice, maxPrice float64, sortOrder string) ([]models.Product, error)
}

type productService struct {
	DB *gorm.DB
}

func NewProductService(db *gorm.DB) ProductService {
	return &productService{DB: db}
}

func (s *productService) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.DB.Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *productService) CreateProduct(input models.ProductCreateInput) (models.Product, error) {
	product := models.Product{
		Name:  input.Name,
		Price: input.Price,
	}
	if err := s.DB.Create(&product).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}

// UpdateProduct updates an existing product
func (s *productService) UpdateProduct(id string, input models.ProductUpdateInput) (models.Product, error) {
	var product models.Product
	if err := s.DB.First(&product, id).Error; err != nil {
		return models.Product{}, err
	}
	product.Name = input.Name
	product.Price = input.Price
	if err := s.DB.Save(&product).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}

func (s *productService) DeleteProduct(id string) error {
	// Ürünü bul ve sil
	if err := s.DB.Delete(&models.Product{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (s *productService) GetProductsByPriceRangeService(minPrice, maxPrice float64, sortOrder string) ([]models.Product, error) {
	var products []models.Product

	// Define the sorting order
	sort := "price ASC"
	if sortOrder == "desc" {
		sort = "price DESC"
	}

	// Fetch products in the price range and sort them
	result := s.DB.Where("price BETWEEN ? AND ?", minPrice, maxPrice).Order(sort).Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}
	return products, nil
}

func (s *productService) GetProductByID(id string) (models.Product, error) {
	var product models.Product

	if err := s.DB.First(&product, id).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}
