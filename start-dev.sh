#!/bin/bash

# Inventory Management System - Development Startup Script

echo "🚀 Starting Inventory Management System in Development Mode"
echo "============================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start backend services (PostgreSQL + Spring Boot)
echo "📦 Starting backend services..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Build and start backend
echo "🔧 Building Spring Boot backend..."
cd backend
if command -v mvn > /dev/null 2>&1; then
    mvn clean package -DskipTests
else
    ./mvnw clean package -DskipTests
fi
cd ..
echo "🐳 Starting backend with Docker..."
docker-compose up -d backend

# Start frontend development server
echo "⚛️  Starting React frontend..."
cd ../frontend

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend environment file..."
    echo "VITE_API_URL=http://localhost:8080/api" > .env.local
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start development server
echo "🌐 Starting frontend development server..."
npm run dev

echo ""
echo "✅ Development environment is ready!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8080/api"
echo "Swagger UI: http://localhost:8080/api/swagger-ui.html"
echo ""
echo "Default credentials:"
echo "Admin: admin / admin123"
echo "Staff: staff / staff123"
