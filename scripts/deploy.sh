#!/bin/bash

# CryptoQuiver VPS Deployment Script
set -e

echo "🚀 Starting CryptoQuiver deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="cryptoquiver"
IMAGE_NAME="cryptoquiver:latest"
CONTAINER_NAME="cryptoquiver-app"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Remove old images
print_status "Cleaning up old images..."
docker image prune -f

# Build the new image
print_status "Building Docker image..."
docker build -t $IMAGE_NAME .

# Start the services
print_status "Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "🌐 Application is running at:"
    print_status "   - HTTP: http://localhost:8080 (development)"
    print_status "   - HTTPS: https://your-domain.com (production)"
    print_status ""
    print_status "📊 To view logs: docker-compose logs -f"
    print_status "🔄 To restart: docker-compose restart"
    print_status "🛑 To stop: docker-compose down"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
print_status "🎉 CryptoQuiver is now running on your VPS!"
