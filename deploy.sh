#!/bin/bash

# Scheduler System Deployment Script

set -e

echo "🚀 Starting Scheduler System Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Database: localhost:5432"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"