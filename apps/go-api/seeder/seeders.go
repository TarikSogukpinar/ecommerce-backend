package seeders

import (
	"fmt"
	"go-api/models"
	"log"

	"github.com/bxcodec/faker/v3"
	"gorm.io/gorm"
)

func SeedCategories(db *gorm.DB, count int) {
	for i := 0; i < count; i++ {
		category := models.Category{
			Name: faker.Word(),
		}
		result := db.Create(&category)
		if result.Error != nil {
			log.Fatalf("Could not seed category: %v", result.Error)
		}
	}
	fmt.Printf("%d categories seeded successfully\n", count)
}

func SeedProducts(db *gorm.DB, count int) {
	var categories []models.Category
	db.Find(&categories)

	if len(categories) == 0 {
		log.Fatal("No categories found. Seed categories first.")
	}

	for i := 0; i < count; i++ {
		product := models.Product{
			Name:          faker.Word(),
			Description:   faker.Sentence(),
			Price:         faker.Latitude(),
			Quantity:      0,
			Image:         faker.URL(),
			CategoryID:    categories[i%len(categories)].ID,
			DiscountPrice: nil,
			IsActive:      true,
			Stock:         0,
			SKU:           faker.UUIDDigit(),
		}
		result := db.Create(&product)
		if result.Error != nil {
			log.Fatalf("Could not seed product: %v", result.Error)
		}
	}
	fmt.Printf("%d products seeded successfully\n", count)
}
