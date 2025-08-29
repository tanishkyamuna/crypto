#!/bin/bash

# Quick Docker Test Script
echo "🐳 Testing Docker setup for CryptoQuiver..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test simple build
echo "🔨 Testing simple Docker build..."
cat > Dockerfile.simple << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Try to build with timeout
timeout 300 docker build -f Dockerfile.simple -t cryptoquiver:test . || {
    echo "⏰ Build timed out or failed"
    echo "💡 Alternative deployment options:"
    echo "   1. Deploy to Vercel (recommended for Next.js)"
    echo "   2. Use Docker Hub pre-built images"
    echo "   3. Deploy directly on VPS without Docker"
    rm -f Dockerfile.simple
    exit 1
}

echo "✅ Docker build successful!"
rm -f Dockerfile.simple

# Test run
echo "🚀 Testing container run..."
docker run -d -p 3000:3000 --name cryptoquiver-test cryptoquiver:test

sleep 5

# Test health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Container is healthy and running!"
else
    echo "⚠️  Container started but health check failed"
fi

# Cleanup
docker stop cryptoquiver-test
docker rm cryptoquiver-test

echo "🎉 Docker setup test completed!"
