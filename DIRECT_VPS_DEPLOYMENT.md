# Direct VPS Deployment Guide (Option 3)

This guide will help you deploy CryptoQuiver directly on a VPS without Docker.

## 📋 Prerequisites

- Ubuntu 20.04+ VPS with at least 1GB RAM
- SSH access to your VPS
- Domain name (optional but recommended)
- Basic Linux command knowledge

## 🚀 Quick Deployment (Automated)

### Method 1: One-Command Deployment

```bash
# SSH into your VPS first
ssh your-username@your-vps-ip

# Run the automated deployment script
curl -fsSL https://raw.githubusercontent.com/tanishkyamuna/crypto/main/scripts/direct-vps-deploy.sh | bash
```

## 🔧 Manual Deployment (Step by Step)

### Step 1: Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw nginx
```

### Step 2: Install Node.js 18

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/tanishkyamuna/crypto.git cryptoquiver
cd cryptoquiver

# Install dependencies
npm install

# Create environment file
cp .env.example .env.production
nano .env.production  # Edit with your actual values
```

### Step 4: Build the Application

```bash
# Build for production
npm run build

# Test the build
npm start &
curl http://localhost:3000/api/health
# Should return {"status":"ok",...}
```

### Step 5: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 configuration
cat > ecosystem.config.js << 'EOF'
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

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable startup
```

### Step 6: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cryptoquiver
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/cryptoquiver /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Configure Firewall

```bash
# Configure UFW firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### Step 8: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔄 Application Management

### PM2 Commands

```bash
# Check status
pm2 status
pm2 monit  # Real-time monitoring

# View logs
pm2 logs cryptoquiver
pm2 logs cryptoquiver --lines 100

# Restart application
pm2 restart cryptoquiver

# Stop application
pm2 stop cryptoquiver

# Reload (zero-downtime restart)
pm2 reload cryptoquiver
```

### Update Application

```bash
cd ~/cryptoquiver

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild
npm run build

# Restart with PM2
pm2 restart cryptoquiver
```

### Nginx Commands

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoring and Maintenance

### Check Application Health

```bash
# Health check
curl http://localhost:3000/api/health
curl https://your-domain.com/api/health

# Check if processes are running
pm2 status
sudo systemctl status nginx
```

### Log Management

```bash
# Application logs
pm2 logs cryptoquiver

# Nginx logs
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -f
```

### Performance Monitoring

```bash
# Server resources
htop
df -h  # Disk usage
free -h  # Memory usage

# PM2 monitoring
pm2 monit
```

## 🔧 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs cryptoquiver
   npm start  # Test manually
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   sudo nginx -t
   pm2 status  # Check if app is running
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   pm2 stop all
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew
   sudo nginx -t
   ```

### Performance Optimization

1. **Enable Nginx caching**
2. **Configure PM2 clustering**
3. **Set up log rotation**
4. **Monitor resources with htop**

## 📚 Environment Variables

Update your `.env.production` file:

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Your API keys
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key
NEXT_PUBLIC_CRYPTOPANIC_API_KEY=your_api_key
TELEGRAM_BOT_TOKEN=your_bot_token

# Your domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## ✅ Final Checklist

- [ ] Node.js 18+ installed
- [ ] Application cloned and built
- [ ] PM2 running the application
- [ ] Nginx configured as reverse proxy
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Domain DNS pointing to VPS
- [ ] Health check passing

Your CryptoQuiver app should now be live at `https://your-domain.com`! 🎉
