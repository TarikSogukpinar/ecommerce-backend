package services

import (
	"gorm.io/gorm"
)

// Product represents a product in the system
type Product struct {
	gorm.Model
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Price string `json:"price"`
}

// ProductCreateInput holds the input for creating a product
type ProductCreateInput struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

// ProductUpdateInput holds the input for updating a product
type ProductUpdateInput struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

// ProductService defines methods for interacting with the product model
type ProductService interface {
	GetAllProducts() ([]Product, error)
	GetProductByID(id string) (Product, error)
	CreateProduct(input ProductCreateInput) (Product, error)
	UpdateProduct(id string, input ProductUpdateInput) (Product, error)
	DeleteProduct(id string) error
}

// productService implements ProductService
type productService struct {
	db *gorm.DB
}

// NewProductService creates a new product service
func NewProductService(db *gorm.DB) ProductService {
	return &productService{db: db}
}

// GetAllProducts fetches all products from the database
func (s *productService) GetAllProducts() ([]Product, error) {
	var products []Product
	if err := s.db.Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

// GetProductByID fetches a product by its ID
func (s *productService) GetProductByID(id string) (Product, error) {
	var product Product
	if err := s.db.First(&product, id).Error; err != nil {
		return Product{}, err
	}
	return product, nil
}

// CreateProduct creates a new product
func (s *productService) CreateProduct(input ProductCreateInput) (Product, error) {
	product := Product{
		Name:  input.Name,
		Price: input.Price,
	}
	if err := s.db.Create(&product).Error; err != nil {
		return Product{}, err
	}
	return product, nil
}

// UpdateProduct updates an existing product
func (s *productService) UpdateProduct(id string, input ProductUpdateInput) (Product, error) {
	var product Product
	if err := s.db.First(&product, id).Error; err != nil {
		return Product{}, err
	}
	product.Name = input.Name
	product.Price = input.Price
	if err := s.db.Save(&product).Error; err != nil {
		return Product{}, err
	}
	return product, nil
}

// DeleteProduct deletes a product by its ID
func (s *productService) DeleteProduct(id string) error {
	if err := s.db.Delete(&Product{}, id).Error; err != nil {
		return err
	}
	return nil
}
