package models

import "gorm.io/gorm"

// Product represents a product in the system
type Product struct {
	gorm.Model
	ID          uint    `json:"id" gorm:"primaryKey"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
}

// ProductCreateInput holds the input for creating a product
type ProductCreateInput struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
}

// ProductUpdateInput holds the input for updating a product
type ProductUpdateInput struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
}
