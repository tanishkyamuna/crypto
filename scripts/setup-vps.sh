#!/bin/bash

# VPS Setup Script for CryptoQuiver
# Run this script on your VPS to install required dependencies

set -e

echo "🔧 Setting up VPS for CryptoQuiver deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    git

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully!"
else
    print_status "Docker is already installed."
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully!"
else
    print_status "Docker Compose is already installed."
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Development port
print_status "Firewall configured successfully!"

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create application directory
print_status "Creating application directory..."
mkdir -p ~/cryptoquiver
cd ~/cryptoquiver

# Create logs directory
mkdir -p logs/nginx

# Create SSL directory (for future SSL certificates)
mkdir -p nginx/ssl

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/cryptoquiver > /dev/null <<EOF
~/cryptoquiver/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
EOF

print_status "✅ VPS setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Log out and log back in to apply Docker group membership"
print_status "2. Clone your repository: git clone https://github.com/tanishkyamuna/crypto.git ."
print_status "3. Copy .env.example to .env.production and update with your values"
print_status "4. Update nginx/nginx.conf with your domain name"
print_status "5. Run the deployment script: ./scripts/deploy.sh"
print_status ""
print_warning "⚠️  Don't forget to:"
print_warning "   - Set up SSL certificates (Let's Encrypt recommended)"
print_warning "   - Configure your domain DNS to point to this VPS"
print_warning "   - Update environment variables with production values"
