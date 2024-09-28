package services

import (
	"go-api/models"

	"gorm.io/gorm"
)

type ProductService interface {
	GetAllProducts() ([]models.Product, error)
	GetPopularProducts() ([]models.Product, error)
	GetProductByID(id string) (models.Product, error)
	FilterProductsByPrice(minPrice, maxPrice float64) ([]models.Product, error)
	GetLowStockProducts(stockThreshold int) ([]models.Product, error)
	GetDiscountedProducts() ([]models.Product, error)
	UpdateProduct(id string, input models.ProductUpdateInput) (models.Product, error)
	DeleteProduct(id string) error
	GetNewProducts() ([]models.Product, error)
}

// productService implements ProductService
type productService struct {
	db *gorm.DB
}

// NewProductService creates a new product service
func NewProductService(db *gorm.DB) ProductService {
	return &productService{db: db}
}

func (s *productService) GetNewProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Order("created_at desc").Limit(10).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *productService) GetPopularProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Order("sales_count desc").Limit(10).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

// GetAllProducts fetches all products from the database
func (s *productService) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

// GetProductByID fetches a product by its ID
func (s *productService) GetProductByID(id string) (models.Product, error) {
	var product models.Product
	if err := s.db.First(&product, id).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}

// CreateProduct creates a new product
func (s *productService) CreateProduct(input models.ProductCreateInput) (models.Product, error) {
	product := models.Product{
		Name:  input.Name,
		Price: input.Price,
	}
	if err := s.db.Create(&product).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}

// UpdateProduct updates an existing product
func (s *productService) UpdateProduct(id string, input models.ProductUpdateInput) (models.Product, error) {
	var product models.Product
	if err := s.db.First(&product, id).Error; err != nil {
		return models.Product{}, err
	}
	product.Name = input.Name
	product.Price = input.Price
	if err := s.db.Save(&product).Error; err != nil {
		return models.Product{}, err
	}
	return product, nil
}

// DeleteProduct deletes a product by its ID
func (s *productService) DeleteProduct(id string) error {
	if err := s.db.Delete(&models.Product{}, id).Error; err != nil {
		return err
	}
	return nil
}

// FilterProductsByPrice filters products by price range
func (s *productService) FilterProductsByPrice(minPrice, maxPrice float64) ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Where("price >= ? AND price <= ?", minPrice, maxPrice).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *productService) GetDiscountedProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Where("discount_price IS NOT NULL").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *productService) GetLowStockProducts(stockThreshold int) ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Where("stock <= ?", stockThreshold).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}
