#!/bin/bash

# Setup script for GAME MKT Monolito
# Usage: bash scripts/setup.sh

set -e

echo "🚀 Setting up GAME MKT Monolito..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Setup backend
echo "📦 Setting up backend..."
cp backend/.env.example backend/.env
echo "✅ Backend .env created"

# Setup frontend
echo "📦 Setting up frontend..."
cp frontend/.env.example frontend/.env
echo "✅ Frontend .env created"

# Create database directory
mkdir -p data/postgres data/redis

# Download and build images
echo "🐳 Building Docker images..."
docker-compose build

# Create network
docker network create game-mkt-network 2>/dev/null || true

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Available services:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Jaeger:   http://localhost:16686"
echo ""
echo "📚 Next steps:"
echo "   1. Backend development:  cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload"
echo "   2. Frontend development: cd frontend && npm install && npm run dev"
echo "   3. Check logs: docker-compose logs -f backend"
echo ""
