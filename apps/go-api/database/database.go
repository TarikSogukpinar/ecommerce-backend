package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDB initializes the database connection and assigns it to the global variable
func ConnectDB() {
	dsn := "postgresql://tariksogukpinar_outl:3J15cDSta0AZOc2GRW20nA@ecommerce-api-7502.6xw.aws-ap-southeast-1.cockroachlabs.cloud:26257/go-backend?sslmode=verify-full"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connection established")
}
