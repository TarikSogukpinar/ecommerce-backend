package middlewares

import (
	"go-api/rabbitmq"
	"go-api/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AuthRequired is a middleware that checks the validity of the JWT token via RabbitMQ
func AuthRequired(secretKey string, rabbitMQService *rabbitmq.RabbitMQService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Get("Authorization")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing token",
			})
		}

		// Remove "Bearer " prefix if it's present
		token = strings.TrimSpace(strings.TrimPrefix(token, "Bearer"))

		// Validate the JWT token via RabbitMQ
		valid, err := utils.ValidateJWT(rabbitMQService, token)
		if err != nil || !valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		return c.Next()
	}
}
