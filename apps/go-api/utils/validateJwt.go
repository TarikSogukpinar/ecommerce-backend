package utils

import (
	"errors"
	"go-api/rabbitmq"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/streadway/amqp"
)

func ValidateJWT(rabbitMQService *rabbitmq.RabbitMQService, token string) (bool, error) {
	log.Println("Starting JWT validation")

	responseQueue, err := rabbitMQService.Channel.QueueDeclare(
		"",    // name (empty string creates a random name)
		false, // durable
		false, // delete when unused
		true,  // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		log.Printf("Failed to declare a queue: %v", err)
		return false, err
	}

	corrID := uuid.New().String() // UUID ile benzersiz bir Correlation ID oluşturuyoruz
	log.Printf("Correlation ID: %s", corrID)

	err = rabbitMQService.Channel.Publish(
		"",           // exchange
		"auth_queue", // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType:   "application/json",
			CorrelationId: corrID,
			ReplyTo:       responseQueue.Name,
			Body:          []byte(token),
		},
	)
	if err != nil {
		log.Printf("Failed to publish a message: %v", err)
		return false, err
	}

	log.Println("Waiting for a response")
	msgs, err := rabbitMQService.Channel.Consume(
		responseQueue.Name, // queue
		"",                 // consumer
		true,               // auto-ack
		false,              // exclusive
		false,              // no-local
		false,              // no-wait
		nil,                // args
	)
	if err != nil {
		log.Printf("Failed to consume a message: %v", err)
		return false, err
	}

	timeout := time.After(10 * time.Second) // 10 saniyelik zaman aşımı tanımlıyoruz

	select {
	case d := <-msgs:
		if d.CorrelationId == corrID {
			log.Printf("Received a message with correlation ID: %s", corrID)
			if string(d.Body) == "true" {
				log.Println("JWT is valid")
				return true, nil
			} else {
				log.Println("JWT is invalid")
				return false, nil
			}
		}
	case <-timeout:
		log.Println("Timeout while waiting for RabbitMQ response")
		return false, errors.New("timeout while waiting for RabbitMQ response")
	}

	log.Println("No matching message received")
	return false, nil
}
