#!/bin/bash

# Environment Configuration Helper for CryptoQuiver
echo "🔧 CryptoQuiver Environment Configuration"
echo "========================================"

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if .env.production exists
if [ -f "$PROJECT_DIR/.env.production" ]; then
    echo "📄 Found existing .env.production file"
    read -p "Do you want to reconfigure it? (y/N): " reconfigure
    if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
        echo "✅ Using existing configuration"
        exit 0
    fi
fi

echo "🔧 Creating production environment configuration..."

# Copy from example
cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env.production"

echo ""
echo "📝 Please provide the following information:"
echo ""

# Get domain
read -p "🌐 Enter your domain name (e.g., cryptoquiver.com): " domain
if [ ! -z "$domain" ]; then
    sed -i "s|https://your-domain.com|https://$domain|g" "$PROJECT_DIR/.env.production"
fi

# Get bot username
read -p "🤖 Enter your Telegram bot username (without @): " bot_username
if [ ! -z "$bot_username" ]; then
    sed -i "s/your_bot_username/$bot_username/g" "$PROJECT_DIR/.env.production"
fi

# Get bot token
read -p "🔑 Enter your Telegram bot token: " bot_token
if [ ! -z "$bot_token" ]; then
    sed -i "s/your_telegram_bot_token/$bot_token/g" "$PROJECT_DIR/.env.production"
fi

echo ""
echo "📊 API Keys (press Enter to skip if you don't have them yet):"

# CoinGecko API
read -p "💰 CoinGecko API key: " coingecko_api
if [ ! -z "$coingecko_api" ]; then
    sed -i "s/your_coingecko_api_key/$coingecko_api/g" "$PROJECT_DIR/.env.production"
fi

# CryptoPanic API
read -p "📰 CryptoPanic API key: " cryptopanic_api
if [ ! -z "$cryptopanic_api" ]; then
    sed -i "s/your_cryptopanic_api_key/$cryptopanic_api/g" "$PROJECT_DIR/.env.production"
fi

# TAAPI API
read -p "📈 TAAPI.io API key: " taapi_api
if [ ! -z "$taapi_api" ]; then
    sed -i "s/your_taapi_api_key/$taapi_api/g" "$PROJECT_DIR/.env.production"
fi

# Add production-specific settings
cat >> "$PROJECT_DIR/.env.production" << EOF

# Production Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF

echo ""
echo "✅ Environment configuration completed!"
echo ""
echo "📄 Configuration saved to: .env.production"
echo ""
echo "🔍 Review your configuration:"
echo "   nano .env.production"
echo ""
echo "📚 API Key Resources:"
echo "   • CoinGecko: https://www.coingecko.com/en/api"
echo "   • CryptoPanic: https://cryptopanic.com/developers/api/"
echo "   • TAAPI.io: https://taapi.io/"
echo "   • Telegram Bot: https://t.me/BotFather"
echo ""
echo "🚀 Next steps:"
echo "   1. Review and update .env.production"
echo "   2. Run: npm run build"
echo "   3. Start deployment: pm2 start ecosystem.config.js"
