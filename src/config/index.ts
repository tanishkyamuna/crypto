export const API_ENDPOINTS = {
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    COINS_LIST: '/coins/markets',
    COIN_DETAILS: '/coins',
    COIN_HISTORY: '/coins/{id}/market_chart',
    TRENDING: '/search/trending',
    GLOBAL: '/global',
  },
  CRYPTOPANIC: {
    BASE_URL: 'https://cryptopanic.com/api/v1',
    NEWS: '/posts',
  },
  TAAPI: {
    BASE_URL: 'https://api.taapi.io',
    INDICATORS: '/indicators',
  },
  NOWPAYMENTS: {
    BASE_URL: 'https://api.nowpayments.io/v1',
    PAYMENT: '/payment',
    ESTIMATE: '/estimate',
    STATUS: '/payment',
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  '1-month': {
    name: '1 Month Premium',
    duration: 30,
    price_usd: 9.99,
    features: [
      'Advanced technical analysis',
      'Premium trading signals',
      'Real-time alerts',
      'Export watchlists',
      'Priority support',
    ],
  },
  '12-month': {
    name: '12 Month Premium',
    duration: 365,
    price_usd: 79.99,
    discount: 33,
    features: [
      'All premium features',
      'Advanced portfolio tracking',
      'AI-powered insights',
      'Custom indicators',
      'VIP community access',
      'Early access to new features',
    ],
  },
} as const;

export const SUPPORTED_CURRENCIES = {
  USDT: {
    name: 'Tether',
    symbol: 'USDT',
    networks: ['TRC20', 'ERC20', 'BEP20'],
    min_amount: 5,
    confirmations: 1,
  },
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    networks: ['Bitcoin', 'Lightning'],
    min_amount: 0.0001,
    confirmations: 2,
  },
} as const;

export const TECHNICAL_INDICATORS = {
  RSI: {
    name: 'Relative Strength Index',
    overbought: 70,
    oversold: 30,
  },
  MACD: {
    name: 'MACD',
    signal_line: 'MACD Signal',
    histogram: 'MACD Histogram',
  },
  BOLLINGER_BANDS: {
    name: 'Bollinger Bands',
    periods: 20,
    deviation: 2,
  },
  MOVING_AVERAGES: {
    SMA_20: 'Simple Moving Average (20)',
    SMA_50: 'Simple Moving Average (50)',
    SMA_200: 'Simple Moving Average (200)',
    EMA_20: 'Exponential Moving Average (20)',
    EMA_50: 'Exponential Moving Average (50)',
  },
} as const;

export const CHART_PERIODS = {
  '1D': { days: 1, interval: '5m' },
  '7D': { days: 7, interval: '1h' },
  '30D': { days: 30, interval: '4h' },
  '90D': { days: 90, interval: '1d' },
  '1Y': { days: 365, interval: '1d' },
} as const;

export const RISK_LEVELS = {
  low: {
    name: 'Low Risk',
    color: 'green',
    description: 'Conservative, stable investments',
  },
  medium: {
    name: 'Medium Risk',
    color: 'yellow',
    description: 'Balanced risk-reward ratio',
  },
  high: {
    name: 'High Risk',
    color: 'red',
    description: 'High potential returns, high volatility',
  },
} as const;

export const SIGNAL_TYPES = {
  buy: {
    name: 'BUY',
    color: 'green',
    icon: '📈',
  },
  sell: {
    name: 'SELL',
    color: 'red',
    icon: '📉',
  },
  hold: {
    name: 'HOLD',
    color: 'blue',
    icon: '⏸️',
  },
} as const;

export const STRATEGY_TYPES = {
  day: {
    name: 'Day Trading',
    duration: '1-24 hours',
    description: 'Short-term trades within a day',
  },
  swing: {
    name: 'Swing Trading',
    duration: '2-30 days',
    description: 'Medium-term position trading',
  },
  'long-term': {
    name: 'Long-term',
    duration: '1+ months',
    description: 'Long-term investment strategy',
  },
} as const;

export const CPA_TASKS = {
  app_download: {
    title: 'Download Crypto App',
    reward: 7,
    description: 'Download and register on partner crypto app',
  },
  wallet_setup: {
    title: 'Setup Crypto Wallet',
    reward: 14,
    description: 'Create and verify a new crypto wallet',
  },
  exchange_signup: {
    title: 'Exchange Registration',
    reward: 30,
    description: 'Sign up and verify on partner exchange',
  },
} as const;

export const TELEGRAM_COLORS = {
  light: {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#3390ec',
    button_color: '#3390ec',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f1f1f1',
  },
  dark: {
    bg_color: '#212121',
    text_color: '#ffffff',
    hint_color: '#708499',
    link_color: '#6ab7ff',
    button_color: '#6ab7ff',
    button_text_color: '#ffffff',
    secondary_bg_color: '#181818',
  },
} as const;

export const DEFAULT_WATCHLIST = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'solana',
  'cardano',
];

export const NEWS_CATEGORIES = [
  'general',
  'milestone',
  'partnership',
  'exchange-listing',
  'software-release',
  'fund-movement',
  'new-coin',
  'exchange',
] as const;

export const PRICE_CHANGE_COLORS = {
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral: 'text-gray-500',
} as const;

// Environment variables with fallbacks
export const ENV = {
  COINGECKO_API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '',
  CRYPTOPANIC_API_KEY: process.env.CRYPTOPANIC_API_KEY || '',
  TAAPI_API_KEY: process.env.TAAPI_API_KEY || '',
  NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_BOT_SECRET: process.env.TELEGRAM_BOT_SECRET || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
} as const;
