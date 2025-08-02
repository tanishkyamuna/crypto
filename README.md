# CryptoQuiver - Telegram Mini App

A comprehensive cryptocurrency trading and analysis platform built as a Telegram Mini App using Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Features
- **Real-time Market Data**: Live cryptocurrency prices, market caps, and trading volumes
- **Advanced Charts**: Interactive price charts with technical indicators (RSI, MACD, Bollinger Bands)
- **Portfolio Tracking**: Track your cryptocurrency holdings and performance
- **News Integration**: Latest crypto news from CryptoPanic API
- **Trading Signals**: Premium trading signals with performance tracking
- **Price Alerts**: Custom price alerts for your favorite coins
- **Subscription Management**: Flexible subscription plans with crypto payments

### Telegram Integration
- **Native UI**: Seamless integration with Telegram's design system
- **Haptic Feedback**: Enhanced user experience with tactile responses
- **Theme Support**: Automatic dark/light mode based on Telegram settings
- **Cloud Storage**: Sync user preferences across devices
- **Biometric Auth**: Secure authentication for premium features

### Premium Features
- **Advanced Technical Analysis**: Multiple timeframes and indicators
- **Portfolio Analytics**: Detailed performance metrics and insights
- **Priority Support**: Dedicated customer support
- **Custom Alerts**: Unlimited price and volume alerts
- **Trading Signals**: Professional trading recommendations
- **Export Data**: Export portfolio and trading history

### CPA Campaigns
- **Earn Premium Access**: Complete tasks to earn free premium subscription days
- **Partner Integration**: Integration with major crypto platforms
- **Progress Tracking**: Track completion status and rewards
- **Referral System**: Earn rewards for referring friends

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **State Management**: React Hooks + Context API

### APIs Used
- **CoinGecko API**: Market data and cryptocurrency information
- **CryptoPanic API**: Cryptocurrency news and sentiment
- **TAAPI.io**: Technical analysis indicators
- **Telegram Bot API**: Telegram Mini App integration

### Payment Providers
- **NowPayments**: Cryptocurrency payment processing
- **BTCPayServer**: Self-hosted Bitcoin payment processor
- **Telegram Stars**: Native Telegram payment system

## 📋 Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Telegram Bot Token (for Mini App)
- API keys for external services

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cryptoquiver.git
cd cryptoquiver
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and configuration:

```env
NEXT_PUBLIC_APP_URL=https://your-telegram-webapp.vercel.app
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_CRYPTOPANIC_API_KEY=your_cryptopanic_api_key
NEXT_PUBLIC_TAAPI_API_KEY=your_taapi_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
# ... other environment variables
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### 5. Telegram Bot Setup

1. Create a new bot with [@BotFather](https://t.me/botfather)
2. Set up the Mini App with your bot:
   ```
   /newapp
   # Follow the prompts to configure your Mini App
   ```
3. Set the Mini App URL to your deployed app or ngrok tunnel for development

## 📱 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── coins/             # Coin listing and details
│   ├── account/           # User account and subscriptions
│   ├── signals/           # Trading signals
│   └── cpa/               # CPA campaigns
├── components/            # Reusable React components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── api.ts           # API service functions
│   ├── telegram.ts      # Telegram WebApp integration
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
└── config/              # Configuration files
```

### Key Components

#### API Service (`src/lib/api.ts`)
Handles all external API communications:
- CoinGecko for market data
- CryptoPanic for news
- TAAPI.io for technical indicators
- Built-in caching for performance

#### Telegram Integration (`src/lib/telegram.ts`)
Manages Telegram Mini App features:
- WebApp initialization
- Theme detection
- Haptic feedback
- Cloud storage
- Development mocking

#### Layout System (`src/components/layout/AppLayout.tsx`)
Responsive layout with:
- Sidebar navigation (desktop)
- Bottom navigation (mobile)
- Theme switching
- User menu

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🔧 Configuration

### API Keys Setup

1. **CoinGecko API**: Get your free API key from [CoinGecko](https://www.coingecko.com/api)
2. **CryptoPanic API**: Register at [CryptoPanic](https://cryptopanic.com/developers/api/)
3. **TAAPI.io**: Sign up at [TAAPI.io](https://taapi.io/) for technical indicators

### Payment Integration

#### NowPayments Setup
1. Create account at [NowPayments](https://nowpayments.io/)
2. Get API key from dashboard
3. Configure webhook URLs for payment notifications

#### BTCPayServer Setup
1. Deploy BTCPayServer instance or use hosted solution
2. Create store and get API credentials
3. Configure payment methods (Bitcoin, Lightning, etc.)

### Telegram Bot Configuration

1. Set bot commands with BotFather:
   ```
   /setcommands
   start - Start the app
   help - Get help
   settings - App settings
   ```

2. Configure Mini App settings:
   ```
   /setmenubutton
   # Set the Mini App as menu button
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `out/` directory to your hosting provider

### Environment Variables for Production

Ensure all required environment variables are set:
- API keys for external services
- Telegram bot token
- Database connection string (if using)
- Payment provider credentials

## 🔒 Security

### API Security
- All API keys are stored securely in environment variables
- Rate limiting implemented for external API calls
- Input validation on all user inputs

### Payment Security
- PCI DSS compliant payment processing
- Webhook signature verification
- Secure payment flow with confirmation steps

### User Security
- Telegram user verification
- JWT tokens for session management
- Biometric authentication for premium features

## 📊 Analytics & Monitoring

### Performance Monitoring
- API response time tracking
- Error rate monitoring
- User engagement metrics

### Business Metrics
- Subscription conversion rates
- CPA campaign performance
- Revenue tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper error handling
- Include tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Telegram](https://telegram.org/) for the Mini App platform
- [CoinGecko](https://www.coingecko.com/) for market data
- [CryptoPanic](https://cryptopanic.com/) for news feed
- [TAAPI.io](https://taapi.io/) for technical indicators
- [Next.js](https://nextjs.org/) team for the amazing framework

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: support@cryptoquiver.com (replace with your email)
- **Telegram**: [@cryptoquiver_support](https://t.me/cryptoquiver_support) (replace with your support channel)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core market data display
- ✅ Basic charts and indicators
- ✅ Subscription system
- ✅ CPA campaigns

### Phase 2 (Next)
- 🔄 Advanced portfolio management
- 🔄 Social trading features
- 🔄 Advanced alert system
- 🔄 Mobile app (React Native)

### Phase 3 (Future)
- 📋 Copy trading
- 📋 DeFi integration
- 📋 NFT marketplace
- 📋 Advanced analytics dashboard

---

Built with ❤️ for the crypto community
