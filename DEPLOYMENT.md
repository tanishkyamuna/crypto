# CryptoQuiver VPS Deployment Guide

This guide will help you deploy your CryptoQuiver Telegram Mini App on a VPS using Docker.

## Prerequisites

- A VPS with Ubuntu 20.04+ (1GB RAM minimum, 2GB+ recommended)
- A domain name pointing to your VPS IP
- SSH access to your VPS

## Quick Deployment

### 1. Initial VPS Setup

Connect to your VPS and run the setup script:

```bash
# Download and run the VPS setup script
curl -fsSL https://raw.githubusercontent.com/tanishkyamuna/crypto/main/scripts/setup-vps.sh | bash

# Log out and log back in to apply Docker group membership
logout
```

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/tanishkyamuna/crypto.git cryptoquiver
cd cryptoquiver

# Copy environment file and update with your values
cp .env.example .env.production
nano .env.production

# Update nginx configuration with your domain
nano nginx/nginx.conf
# Replace 'your-domain.com' with your actual domain
```

### 3. Deploy the Application

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy the application
./scripts/deploy.sh
```

### 4. Set up SSL (Production)

```bash
# Set up SSL certificates with Let's Encrypt
./scripts/setup-ssl.sh your-domain.com
```

## Manual Deployment Steps

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configure Environment

```bash
# Create environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

**Required Environment Variables:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key
NEXT_PUBLIC_CRYPTOPANIC_API_KEY=your_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 3. Build and Run

```bash
# Build the Docker image
docker build -t cryptoquiver:latest .

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

## Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f cryptoquiver
```

### Maintenance

```bash
# Update application
git pull origin main
docker-compose down
docker build -t cryptoquiver:latest .
docker-compose up -d

# Clean up old images
docker image prune -f

# Backup data (if using volumes)
docker run --rm -v cryptoquiver_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## Monitoring

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check nginx status
curl -I http://localhost:80

# View system resources
htop
```

### Logs

```bash
# Application logs
docker-compose logs -f cryptoquiver

# Nginx logs
docker-compose logs -f nginx

# System logs
journalctl -u docker
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER ~/cryptoquiver
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   ```

4. **Container won't start**
   ```bash
   docker-compose logs cryptoquiver
   docker-compose down && docker-compose up -d
   ```

### Performance Optimization

1. **Enable Nginx caching**
   - Already configured in nginx.conf

2. **Database connection pooling**
   - Add connection pooling if using a database

3. **CDN integration**
   - Consider using CloudFlare for static assets

## Security Considerations

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker updates
docker-compose pull
docker-compose up -d
```

### Backup Strategy

1. **Code backup**: Git repository
2. **Data backup**: Regular database dumps
3. **Configuration backup**: Environment files and nginx config

## Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Error tracking configured (Sentry)
- [ ] Load testing completed

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues
4. Contact support

## Architecture

```
Internet → Domain → VPS → Nginx → Docker Container → Next.js App
                      ↓
                  SSL/TLS Termination
                  Rate Limiting
                  Static File Caching
```

The deployment uses:
- **Docker** for containerization
- **Nginx** as reverse proxy with SSL termination
- **Let's Encrypt** for free SSL certificates
- **UFW** for firewall protection
- **Fail2ban** for intrusion prevention
