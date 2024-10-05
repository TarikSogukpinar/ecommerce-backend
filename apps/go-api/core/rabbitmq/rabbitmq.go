package rabbitmq

import (
	"encoding/json"
	"go-api/middleware"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type TokenPayload struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Email        string `json:"email"`
}

type Message struct {
	Result TokenPayload `json:"result"`
}

var Conn *amqp.Connection
var Ch *amqp.Channel

func InitializeRabbitMQ() (*amqp.Connection, *amqp.Channel, error) {
	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		return nil, nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, nil, err
	}

	Conn = conn
	Ch = ch

	return conn, ch, nil
}

func ConsumeMessages(ch *amqp.Channel) {
	msgs, err := ch.Consume(
		"token_created_queue",
		"",
		true,  // Auto-acknowledge
		false, // Exclusive
		false, // No-local
		false, // No-wait
		nil,   // Arguments
	)
	if err != nil {
		log.Fatalf("Queue messages could not be received: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Incoming message: %s", d.Body)

			var message Message
			err := json.Unmarshal(d.Body, &message)
			if err != nil {
				log.Printf("Message parsing error: %s", err)
				continue
			}

			payload := message.Result

			log.Printf("Message content: %+v", payload)
			log.Println("Access token:", payload.AccessToken)

			claims, err := middleware.ValidateToken(payload.AccessToken)
			if err != nil {
				log.Println("Invalid token:", err)
				continue
			}

			log.Printf("Token is valid, user: %v", claims["id"])
		}
	}()

	<-forever
}

func CloseRabbitMQ() {
	if Ch != nil {
		Ch.Close()
	}
	if Conn != nil {
		Conn.Close()
	}
}
