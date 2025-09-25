#!/bin/bash

# Scheduler System Development Setup Script

set -e

echo "🛠️  Setting up Scheduler System for Development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL service..."
sudo service postgresql start

# Create database and user
echo "🗄️  Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE scheduler_db;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER scheduler_user WITH PASSWORD 'scheduler_password';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scheduler_db TO scheduler_user;" 2>/dev/null || echo "Privileges already granted"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

# Build backend
echo "🏗️  Building backend..."
cd backend && npm run build && cd ..

echo ""
echo "✅ Development setup completed!"
echo ""
echo "🚀 To start development servers:"
echo "   npm run start:dev"
echo ""
echo "🌐 Development URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📝 Other useful commands:"
echo "   npm run build:all  - Build both frontend and backend"
echo "   npm run test:all   - Run all tests"
echo "   npm run migrate    - Run database migrations"