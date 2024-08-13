# Base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install Prisma CLI
RUN npm install -g prisma

# Copy source files
COPY . .

# Generate Prisma client
RUN prisma generate

# Build the app
RUN npm run build

# Expose port
EXPOSE 6000

# Start the app
CMD ["npm", "run", "start:prod"]