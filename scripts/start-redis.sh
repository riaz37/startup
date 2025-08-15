#!/bin/bash

# Redis Startup Script for Sohozdaam Platform

echo "🚀 Starting Redis for Sohozdaam Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create Redis data directory if it doesn't exist
mkdir -p redis/data

# Start Redis services
echo "📦 Starting Redis services..."
docker-compose up -d redis

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Check Redis health
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running and healthy!"
    echo "📍 Redis URL: redis://localhost:6379"
    echo "🔍 Redis Commander: http://localhost:8081 (admin/sohozdaam123)"
    echo ""
    echo "To start with monitoring: docker-compose --profile monitoring up -d"
    echo "To start with high availability: docker-compose --profile ha up -d"
    echo "To stop: docker-compose down"
else
    echo "❌ Redis failed to start properly. Check logs with: docker-compose logs redis"
    exit 1
fi

# Optional: Start Redis Commander for web-based management
if [ "$1" = "--with-monitoring" ]; then
    echo "📊 Starting Redis Commander..."
    docker-compose --profile monitoring up -d redis-commander
    echo "🌐 Redis Commander available at: http://localhost:8081"
    echo "👤 Username: admin"
    echo "🔑 Password: sohozdaam123"
fi

# Optional: Start Redis Sentinel for high availability
if [ "$1" = "--with-ha" ]; then
    echo "🔄 Starting Redis Sentinel for high availability..."
    docker-compose --profile ha up -d redis-sentinel
    echo "🔄 Redis Sentinel running on port 26379"
fi

echo ""
echo "🎉 Redis setup complete! Your Sohozdaam platform can now use Redis caching." 