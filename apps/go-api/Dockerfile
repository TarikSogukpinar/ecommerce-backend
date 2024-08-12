# Base image
FROM golang:1.22.5-alpine

# Set working directory
WORKDIR /go/src/app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o main .

# Expose port 8080 to the outside world
EXPOSE 6060

# Command to run the executable
CMD ["./main"]
