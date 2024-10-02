package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model `json:"-" swaggerignore:"true"`
	Name       string `json:"name"`
}
