import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'USD'): string {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  }
  
  if (price < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(price);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
}

export function formatVolume(volume: number): string {
  return formatMarketCap(volume);
}

export function formatPercentage(percentage: number): string {
  if (isNaN(percentage)) return '0.00%';
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
}

export function getPercentageColor(percentage: number): string {
  if (percentage > 0) return 'text-green-500';
  if (percentage < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return formatDate(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateTelegramWebAppData(initData: string, botSecret: string): boolean {
  // Simplified validation - in production, implement proper hash validation
  // using crypto-js and the Telegram WebApp validation algorithm
  return initData.length > 0;
}

export function parseTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const user = params.get('user');
  const authDate = params.get('auth_date');
  const hash = params.get('hash');
  
  return {
    user: user ? JSON.parse(user) : null,
    authDate: authDate ? parseInt(authDate) : null,
    hash,
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidCryptoAddress(address: string, currency: 'BTC' | 'USDT'): boolean {
  // Simplified validation - in production, use proper crypto address validation
  if (currency === 'BTC') {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
  }
  if (currency === 'USDT') {
    return /^T[a-zA-Z0-9]{33}$|^0x[a-fA-F0-9]{40}$/.test(address);
  }
  return false;
}

export function calculateSubscriptionPrice(plan: '1-month' | '12-month', currency: 'USDT' | 'BTC', exchangeRate: number): number {
  const basePrices = {
    '1-month': 9.99,
    '12-month': 79.99,
  };
  
  const priceUSD = basePrices[plan];
  
  if (currency === 'USDT') {
    return priceUSD;
  }
  
  // For BTC, convert USD to BTC using exchange rate
  return priceUSD / exchangeRate;
}

export function getSubscriptionExpiry(plan: '1-month' | '12-month'): Date {
  const now = new Date();
  const days = plan === '1-month' ? 30 : 365;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isSubscriptionActive(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

export function sortCoins(coins: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return [...coins].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

export function filterCoins(coins: any[], filters: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  category?: string;
}) {
  return coins.filter(coin => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!coin.name.toLowerCase().includes(search) && 
          !coin.symbol.toLowerCase().includes(search)) {
        return false;
      }
    }
    
    if (filters.minPrice && coin.current_price < filters.minPrice) {
      return false;
    }
    
    if (filters.maxPrice && coin.current_price > filters.maxPrice) {
      return false;
    }
    
    if (filters.minMarketCap && coin.market_cap < filters.minMarketCap) {
      return false;
    }
    
    if (filters.maxMarketCap && coin.market_cap > filters.maxMarketCap) {
      return false;
    }
    
    return true;
  });
}

export function calculateRSI(prices: number[], periods = 14): number {
  if (prices.length < periods + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= periods; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  const avgGain = gains / periods;
  const avgLoss = losses / periods;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calculateSMA(prices: number[], periods: number): number {
  if (prices.length < periods) return prices[prices.length - 1] || 0;
  
  const sum = prices.slice(-periods).reduce((acc, price) => acc + price, 0);
  return sum / periods;
}

export function calculateEMA(prices: number[], periods: number): number {
  if (prices.length < periods) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (periods + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
    return Promise.resolve();
  }
}

export function shareData(data: { title?: string; text?: string; url?: string }): Promise<void> {
  if (navigator.share) {
    return navigator.share(data);
  } else {
    // Fallback - copy to clipboard
    const shareText = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`.trim();
    return copyToClipboard(shareText);
  }
}
