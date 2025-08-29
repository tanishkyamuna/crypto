# Alternative Deployment Guide

Since Docker builds might be slow on your machine, here are alternative deployment methods:

## 🚀 Option 1: Vercel Deployment (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js apps:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: cryptoquiver
# - Directory: ./
# - Override settings? No
```

**Advantages:**
- ✅ Automatic builds and deployments
- ✅ Built-in CDN and edge functions
- ✅ Perfect Next.js integration
- ✅ Free tier available
- ✅ Custom domains support

## 🐳 Option 2: Simplified Docker Deployment

If you want to use Docker but builds are slow:

```bash
# Use a simpler Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🖥️ Option 3: Direct VPS Deployment (No Docker)

Deploy directly on VPS without Docker:

```bash
# On your VPS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/tanishkyamuna/crypto.git
cd crypto
npm install
npm run build

# Install PM2 for process management
npm install -g pm2

# Start the app
pm2 start npm --name "cryptoquiver" -- start
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/cryptoquiver
```

Nginx config for direct deployment:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌐 Option 4: Railway Deployment

Railway offers simple container deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📦 Option 5: Docker Hub Pre-built Images

Create automated builds on Docker Hub:

1. Connect GitHub to Docker Hub
2. Create automated build repository
3. Use the pre-built image on VPS:

```bash
docker pull yourusername/cryptoquiver:latest
docker run -d -p 3000:3000 yourusername/cryptoquiver:latest
```

## ⚡ Quick Choice Guide

**For beginners:** Use Vercel (Option 1)
**For production control:** Direct VPS deployment (Option 3)
**For containerization:** Railway (Option 4) or Docker Hub (Option 5)
**For learning Docker:** Fix local Docker issues and use Option 2

## 🔧 Docker Build Optimization Tips

If you want to fix Docker build issues:

1. **Increase Docker memory allocation** (Docker Desktop → Settings → Resources)
2. **Use multi-stage builds** for smaller images
3. **Add .dockerignore** to exclude unnecessary files
4. **Use npm ci instead of npm install**
5. **Cache node_modules** in Docker layers

Would you like detailed instructions for any of these options?
