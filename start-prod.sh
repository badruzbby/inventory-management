#!/bin/bash

# Inventory Management System - Production Startup Script

echo "🚀 Starting Inventory Management System in Production Mode"
echo "==========================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build backend first
echo "🔧 Building Spring Boot backend..."
cd backend
if command -v mvn > /dev/null 2>&1; then
    mvn clean package -DskipTests
else
    ./mvnw clean package -DskipTests
fi
cd ..

# Build and start all services
echo "🏗️  Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Production environment is ready!"
echo "Backend API: http://localhost:8080/api"
echo "Swagger UI: http://localhost:8080/api/swagger-ui.html"
echo "Database: PostgreSQL on port 5432"
echo ""
echo "Default credentials:"
echo "Admin: admin / admin123"
echo "Staff: staff / staff123"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
