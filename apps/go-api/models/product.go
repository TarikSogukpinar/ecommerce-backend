package models

import (
	"gorm.io/gorm"
)

// Product struct represents the product table in the database
type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
}
