package database

import (
	"go-api/models"
	"log"
	"os"

	seeders "go-api/seeder"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Product{}, &models.Category{})
	if err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("Database connection established")

	seeders.SeedCategories(DB, 5)
	seeders.SeedProducts(DB, 20)

}
