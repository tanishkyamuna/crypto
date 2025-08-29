#!/bin/bash

# Direct VPS Deployment Script for CryptoQuiver
# This script sets up CryptoQuiver directly on a VPS without Docker

set -e

echo "🚀 CryptoQuiver Direct VPS Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Create a regular user first."
   exit 1
fi

print_step "Step 1: Update system packages"
sudo apt update && sudo apt upgrade -y
print_success "System updated successfully"

print_step "Step 2: Install Node.js 18"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js $(node -v) installed"
else
    print_success "Node.js $(node -v) already installed"
fi

print_step "Step 3: Install Git (if not installed)"
if ! command -v git &> /dev/null; then
    sudo apt install -y git
fi
print_success "Git installed"

print_step "Step 4: Install PM2 for process management"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed globally"
else
    print_success "PM2 already installed"
fi

print_step "Step 5: Clone the repository"
if [ -d "cryptoquiver" ]; then
    print_warning "Directory cryptoquiver already exists. Updating..."
    cd cryptoquiver
    git pull origin main
else
    git clone https://github.com/tanishkyamuna/crypto.git cryptoquiver
    cd cryptoquiver
fi
print_success "Repository cloned/updated"

print_step "Step 6: Install dependencies"
npm install
print_success "Dependencies installed"

print_step "Step 7: Create production environment file"
if [ ! -f ".env.production" ]; then
    cp .env.example .env.production
    print_warning "Created .env.production from example. Please edit it with your actual values:"
    print_warning "nano .env.production"
    read -p "Press Enter after you've updated the environment variables..."
fi

print_step "Step 8: Build the application"
npm run build
print_success "Application built successfully"

print_step "Step 9: Setup PM2 process"
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cryptoquiver',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Stop existing PM2 process if running
pm2 stop cryptoquiver 2>/dev/null || true
pm2 delete cryptoquiver 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js
pm2 save
print_success "Application started with PM2"

print_step "Step 10: Setup PM2 to start on boot"
sudo pm2 startup systemd -u $USER --hp $HOME
print_success "PM2 configured to start on boot"

print_step "Step 11: Install and configure Nginx"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# Create Nginx configuration
DOMAIN="your-domain.com"
read -p "Enter your domain name (or press Enter for default config): " input_domain
if [ ! -z "$input_domain" ]; then
    DOMAIN=$input_domain
fi

sudo tee /etc/nginx/sites-available/cryptoquiver > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/cryptoquiver /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "Nginx configured and started"

print_step "Step 12: Configure firewall"
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
print_success "Firewall configured"

print_step "Step 13: Install SSL certificate (Let's Encrypt)"
if [ "$DOMAIN" != "your-domain.com" ]; then
    sudo apt install -y certbot python3-certbot-nginx
    
    print_warning "Setting up SSL certificate for $DOMAIN"
    print_warning "Make sure your domain DNS points to this server's IP address"
    read -p "Press Enter when ready to get SSL certificate..."
    
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    print_success "SSL certificate installed"
else
    print_warning "Skipping SSL setup. Run this later: sudo certbot --nginx -d yourdomain.com"
fi

print_step "Final: Verify deployment"
sleep 5

if pm2 list | grep -q "cryptoquiver.*online"; then
    print_success "✅ PM2 process is running"
else
    print_error "❌ PM2 process failed to start"
fi

if sudo systemctl is-active --quiet nginx; then
    print_success "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
fi

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "✅ Application health check passed"
else
    print_warning "⚠️ Application health check failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo "========================================"
echo "📊 Status:"
echo "   • Application: http://$DOMAIN"
echo "   • PM2 Dashboard: pm2 monit"
echo "   • Logs: pm2 logs cryptoquiver"
echo "   • Restart: pm2 restart cryptoquiver"
echo ""
echo "🔧 Useful commands:"
echo "   • pm2 status              - Check process status"
echo "   • pm2 logs cryptoquiver   - View logs"
echo "   • pm2 restart cryptoquiver - Restart app"
echo "   • pm2 stop cryptoquiver   - Stop app"
echo "   • sudo systemctl status nginx - Check Nginx"
echo "   • sudo nginx -t           - Test Nginx config"
echo ""
echo "📚 Next steps:"
echo "   1. Update DNS to point $DOMAIN to this server"
echo "   2. Test your application at http://$DOMAIN"
echo "   3. Set up monitoring and backups"
echo "   4. Configure environment variables in .env.production"
