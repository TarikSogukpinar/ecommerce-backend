package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model    `json:"-" swaggerignore:"true"`
	ID            uint     `json:"id" gorm:"primaryKey"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	Quantity      int      `json:"quantity"`
	Image         string   `json:"image"`
	CategoryID    uint     `json:"category_id"`
	Category      Category `json:"category" gorm:"foreignKey:CategoryID"`
	DiscountPrice *float64 `json:"discount_price"`
	IsActive      bool     `json:"is_active"`
	Stock         int      `json:"stock"`
	SKU           string   `json:"sku"`
}

type ProductCreateInput struct {
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	Quantity      int      `json:"quantity"`
	Image         string   `json:"image"`
	CategoryID    uint     `json:"category_id"`
	DiscountPrice *float64 `json:"discount_price"`
	IsActive      bool     `json:"is_active"`
	Stock         int      `json:"stock"`
	SKU           string   `json:"sku"`
}

type ProductUpdateInput struct {
	Name          string   `json:"name,omitempty"`
	Description   string   `json:"description,omitempty"`
	Price         float64  `json:"price,omitempty"`
	Quantity      int      `json:"quantity,omitempty"`
	Image         string   `json:"image,omitempty"`
	CategoryID    uint     `json:"category_id,omitempty"`
	DiscountPrice *float64 `json:"discount_price,omitempty"`
	IsActive      bool     `json:"is_active,omitempty"`
	Stock         int      `json:"stock,omitempty"`
	SKU           string   `json:"sku,omitempty"`
}
