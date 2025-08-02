import axios from 'axios';
import { API_ENDPOINTS } from '@/config';
import type { Coin, CoinDetails, ChartData, NewsItem, TechnicalIndicators } from '@/types';

// Create axios instances with default configurations
const coingeckoApi = axios.create({
  baseURL: API_ENDPOINTS.COINGECKO.BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

const cryptopanicApi = axios.create({
  baseURL: API_ENDPOINTS.CRYPTOPANIC.BASE_URL,
  timeout: 10000,
});

const taapiApi = axios.create({
  baseURL: API_ENDPOINTS.TAAPI.BASE_URL,
  timeout: 10000,
});

// Add request interceptors for API keys
coingeckoApi.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (apiKey) {
    config.headers['x-cg-demo-api-key'] = apiKey;
  }
  return config;
});

cryptopanicApi.interceptors.request.use((config) => {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  if (apiKey) {
    config.params = { ...config.params, auth_token: apiKey };
  }
  return config;
});

taapiApi.interceptors.request.use((config) => {
  const apiKey = process.env.TAAPI_API_KEY;
  if (apiKey) {
    config.headers['X-API-KEY'] = apiKey;
  }
  return config;
});

// CoinGecko API functions
export const coinGeckoService = {
  async getCoins(
    page = 1,
    perPage = 100,
    category?: string,
    order = 'market_cap_desc'
  ): Promise<Coin[]> {
    try {
      const response = await coingeckoApi.get(API_ENDPOINTS.COINGECKO.COINS_LIST, {
        params: {
          vs_currency: 'usd',
          order,
          per_page: perPage,
          page,
          sparkline: true,
          price_change_percentage: '1h,24h,7d,30d',
          category,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coins:', error);
      throw new Error('Failed to fetch coins data');
    }
  },

  async getCoinDetails(coinId: string): Promise<CoinDetails> {
    try {
      const response = await coingeckoApi.get(
        `${API_ENDPOINTS.COINGECKO.COIN_DETAILS}/${coinId}`,
        {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: true,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      throw new Error('Failed to fetch coin details');
    }
  },

  async getCoinHistory(
    coinId: string,
    days = 7,
    interval = 'daily'
  ): Promise<ChartData> {
    try {
      const response = await coingeckoApi.get(
        API_ENDPOINTS.COINGECKO.COIN_HISTORY.replace('{id}', coinId),
        {
          params: {
            vs_currency: 'usd',
            days,
            interval,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching coin history:', error);
      throw new Error('Failed to fetch coin history');
    }
  },

  async getTrendingCoins(): Promise<any> {
    try {
      const response = await coingeckoApi.get(API_ENDPOINTS.COINGECKO.TRENDING);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw new Error('Failed to fetch trending coins');
    }
  },

  async getGlobalData(): Promise<any> {
    try {
      const response = await coingeckoApi.get(API_ENDPOINTS.COINGECKO.GLOBAL);
      return response.data;
    } catch (error) {
      console.error('Error fetching global data:', error);
      throw new Error('Failed to fetch global data');
    }
  },

  async searchCoins(query: string): Promise<any> {
    try {
      const response = await coingeckoApi.get('/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search coins');
    }
  },
};

// CryptoPanic API functions
export const cryptoPanicService = {
  async getNews(
    currencies?: string[],
    kind?: string,
    regions?: string,
    filter = 'hot',
    page = 1
  ): Promise<{ count: number; next: string | null; previous: string | null; results: NewsItem[] }> {
    try {
      const response = await cryptopanicApi.get(API_ENDPOINTS.CRYPTOPANIC.NEWS, {
        params: {
          currencies: currencies?.join(','),
          kind,
          regions,
          filter,
          page,
          public: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news');
    }
  },

  async getCoinNews(coinSymbol: string, page = 1): Promise<NewsItem[]> {
    try {
      const response = await this.getNews([coinSymbol], undefined, undefined, 'hot', page);
      return response.results;
    } catch (error) {
      console.error('Error fetching coin news:', error);
      return [];
    }
  },
};

// TAAPI.io for technical analysis
export const technicalAnalysisService = {
  async getTechnicalIndicators(
    symbol: string,
    exchange = 'binance',
    interval = '1h'
  ): Promise<TechnicalIndicators> {
    try {
      const [rsiResponse, macdResponse, bbResponse, smaResponse, emaResponse] = await Promise.all([
        taapiApi.get('/rsi', {
          params: { symbol, exchange, interval },
        }),
        taapiApi.get('/macd', {
          params: { symbol, exchange, interval },
        }),
        taapiApi.get('/bbands', {
          params: { symbol, exchange, interval },
        }),
        taapiApi.get('/sma', {
          params: { symbol, exchange, interval, period: 20 },
        }),
        taapiApi.get('/ema', {
          params: { symbol, exchange, interval, period: 20 },
        }),
      ]);

      // Get additional moving averages
      const [sma50, sma200, ema50] = await Promise.all([
        taapiApi.get('/sma', {
          params: { symbol, exchange, interval, period: 50 },
        }),
        taapiApi.get('/sma', {
          params: { symbol, exchange, interval, period: 200 },
        }),
        taapiApi.get('/ema', {
          params: { symbol, exchange, interval, period: 50 },
        }),
      ]);

      return {
        rsi: rsiResponse.data.value,
        macd: {
          macd: macdResponse.data.valueMACD,
          signal: macdResponse.data.valueMACDSignal,
          histogram: macdResponse.data.valueMACDHist,
        },
        bollinger_bands: {
          upper: bbResponse.data.valueUpperBand,
          middle: bbResponse.data.valueMiddleBand,
          lower: bbResponse.data.valueLowerBand,
        },
        moving_averages: {
          sma_20: smaResponse.data.value,
          sma_50: sma50.data.value,
          sma_200: sma200.data.value,
          ema_20: emaResponse.data.value,
          ema_50: ema50.data.value,
        },
      };
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      // Return default values if API fails
      return {
        rsi: 50,
        macd: { macd: 0, signal: 0, histogram: 0 },
        bollinger_bands: { upper: 0, middle: 0, lower: 0 },
        moving_averages: { sma_20: 0, sma_50: 0, sma_200: 0, ema_20: 0, ema_50: 0 },
      };
    }
  },

  async getRSI(symbol: string, period = 14, exchange = 'binance', interval = '1h'): Promise<number> {
    try {
      const response = await taapiApi.get('/rsi', {
        params: { symbol, exchange, interval, period },
      });
      return response.data.value;
    } catch (error) {
      console.error('Error fetching RSI:', error);
      return 50; // Default neutral value
    }
  },
};

// Mock payment service (replace with actual payment provider integration)
export const paymentService = {
  async createPayment(amount: number, currency: 'USDT' | 'BTC', subscriptionId: string) {
    // This would integrate with NowPayments, BTCPayServer, etc.
    // For now, return mock data
    return {
      id: `payment_${Date.now()}`,
      amount,
      currency,
      status: 'pending',
      payment_address: currency === 'BTC' 
        ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
        : 'TQn9Y2khEsLMJ4puBy2b1ZpSS2AoSsW3im',
      qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      confirmations: 0,
      required_confirmations: currency === 'BTC' ? 2 : 1,
    };
  },

  async getPaymentStatus(paymentId: string) {
    // Mock implementation
    return {
      id: paymentId,
      status: 'pending',
      confirmations: 0,
      transaction_id: null,
    };
  },

  async estimatePayment(amount: number, fromCurrency: string, toCurrency: string) {
    // Mock implementation
    const rate = fromCurrency === 'USD' && toCurrency === 'BTC' ? 0.000023 : 1;
    return {
      estimated_amount: amount * rate,
      rate,
      fee: amount * 0.005, // 0.5% fee
    };
  },
};

// Error handling utility
export const handleApiError = (error: any, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    return error.response.data.message || fallbackMessage;
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.message);
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    console.error('Error:', error.message);
    return fallbackMessage;
  }
};

// Cache management for API responses
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
