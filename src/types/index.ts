export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinDetails extends Coin {
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: number;
    telegram_channel_identifier: string;
    subreddit_url: string;
  };
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger_bands: {
    upper: number;
    middle: number;
    lower: number;
  };
  moving_averages: {
    sma_20: number;
    sma_50: number;
    sma_200: number;
    ema_20: number;
    ema_50: number;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: {
    domain: string;
    title: string;
    region: string;
    path: string;
  };
  published_at: string;
  created_at: string;
  domain: string;
  votes: {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  kind: string;
  currencies: Array<{
    code: string;
    title: string;
    slug: string;
    url: string;
  }>;
}

export interface TradingSignal {
  id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  signal_type: 'buy' | 'sell' | 'hold';
  strategy_type: 'day' | 'swing' | 'long-term';
  risk_level: 'low' | 'medium' | 'high';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence: number; // 0-100
  reasoning: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'completed' | 'cancelled';
  performance?: {
    current_price: number;
    pnl_percentage: number;
  };
}

export interface User {
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  subscription_status: 'free' | 'premium';
  subscription_expires_at?: string;
  created_at: string;
  last_active: string;
  watchlist: string[]; // coin IDs
  preferences: {
    default_currency: string;
    notifications_enabled: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface Subscription {
  id: string;
  user_id: number;
  plan: '1-month' | '12-month';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  payment_method: 'USDT' | 'BTC';
  amount: number;
  currency: string;
  payment_address?: string;
  transaction_id?: string;
  created_at: string;
  expires_at: string;
  auto_renew: boolean;
}

export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: 'USDT' | 'BTC';
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';
  payment_address: string;
  qr_code: string;
  transaction_id?: string;
  confirmations?: number;
  required_confirmations: number;
  created_at: string;
  expires_at: string;
  webhook_data?: any;
}

export interface CPACampaign {
  id: string;
  title: string;
  description: string;
  reward_type: 'premium_days' | 'tokens';
  reward_amount: number;
  requirements: {
    action: string;
    url: string;
    verification_method: 'postback' | 'manual';
  };
  status: 'active' | 'paused' | 'completed';
  max_participants: number;
  current_participants: number;
  created_at: string;
  expires_at: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  onEvent?: (eventType: string, callback: (data?: any) => void) => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink?: (url: string) => void;
  CloudStorage?: {
    setItem: (key: string, value: string, callback?: (error: string | null) => void) => void;
    getItem: (key: string, callback: (error: string | null, value?: string) => void) => void;
    removeItem: (key: string, callback?: (error: string | null) => void) => void;
  };
  BiometricManager?: {
    authenticate: (params: { reason: string }, callback: (success: boolean) => void) => void;
  };
  showScanQrPopup?: (params: { text: string }, callback: (data: string) => void) => void;
  closeScanQrPopup?: () => void;
  close: () => void;
  expand: () => void;
  ready: () => void;
}
