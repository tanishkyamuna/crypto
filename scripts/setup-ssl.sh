#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Run this after setting up your domain DNS

set -e

echo "🔒 Setting up SSL certificates with Let's Encrypt..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <your-domain.com>"
    print_error "Example: $0 cryptoquiver.example.com"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@$DOMAIN"  # Change this to your email

print_status "Setting up SSL for domain: $DOMAIN"

# Install Certbot
print_status "Installing Certbot..."
sudo apt update
sudo apt install -y certbot

# Stop nginx if running
print_status "Stopping nginx temporarily..."
docker-compose stop nginx 2>/dev/null || true

# Get SSL certificate
print_status "Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

# Copy certificates to nginx directory
print_status "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*.pem
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem

# Update nginx configuration with the domain
print_status "Updating nginx configuration..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf

# Set up auto-renewal
print_status "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cd ~/cryptoquiver && docker-compose restart nginx'") | crontab -

# Restart services
print_status "Restarting services..."
docker-compose up -d

print_status "✅ SSL setup completed successfully!"
print_status "🌐 Your site should now be available at: https://$DOMAIN"
print_status "🔄 SSL certificates will auto-renew every 60 days"
