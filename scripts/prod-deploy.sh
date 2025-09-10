#!/bin/bash

# Production deployment script

set -e

echo "🚀 Deploying Prompt Management Platform to production..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start services
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Setup database (if needed)
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:deploy

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Production deployment complete!"
echo ""
echo "📊 Services are running:"
echo "  - Application: http://localhost (or your domain)"
echo "  - API Health: http://localhost/health"
echo ""
echo "🔧 Management commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Update: ./scripts/prod-deploy.sh"
