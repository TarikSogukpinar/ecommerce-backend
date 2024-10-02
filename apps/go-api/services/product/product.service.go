package services

import (
	"fmt"
	"go-api/models"

	"gorm.io/gorm"
)

type ProductService interface {
	GetAllProducts() ([]models.Product, error)
	GetProductByID(id string) (models.Product, error)
	UpdateProduct(id string, input models.ProductUpdateInput) (models.Product, error)
	DeleteProduct(id string) error
	GetProductsByPriceRange(minPrice, maxPrice float64, sortOrder string) ([]models.Product, error)
	UpdateProductStock(id string, newStock int) (models.Product, error)
	BulkUpdatePrices(priceUpdates []models.ProductPriceUpdateInput) error
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
	if err := s.DB.Delete(&models.Product{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (s *productService) GetProductsByPriceRange(minPrice, maxPrice float64, sortOrder string) ([]models.Product, error) {
	var products []models.Product

	sort := "price ASC"
	if sortOrder == "desc" {
		sort = "price DESC"
	}

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

func (s *productService) UpdateProductStock(id string, newStock int) (models.Product, error) {
	var product models.Product
	if err := s.DB.First(&product, id).Error; err != nil {
		return models.Product{}, err
	}

	product.Stock = newStock

	if err := s.DB.Save(&product).Error; err != nil {
		return models.Product{}, err
	}

	return product, nil
}

func (s *productService) BulkUpdatePrices(priceUpdates []models.ProductPriceUpdateInput) error {
	for _, update := range priceUpdates {
		var product models.Product
		// Ürünü ID'ye göre buluyoruz
		if err := s.DB.First(&product, update.ID).Error; err != nil {
			return fmt.Errorf("product with ID %s not found", update.ID)
		}
		// Fiyatı güncelliyoruz
		product.Price = update.Price
		// Güncellenen ürünü veritabanına kaydediyoruz
		if err := s.DB.Save(&product).Error; err != nil {
			return fmt.Errorf("failed to update price for product ID %s: %v", update.ID, err)
		}
	}
	return nil
}
