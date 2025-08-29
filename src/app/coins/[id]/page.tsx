'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  NewspaperIcon,
  LinkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { coinGeckoService, cryptoPanicService, technicalAnalysisService } from '@/lib/api';
import { formatPrice, formatPercentage, getPercentageColor, formatMarketCap, formatDate, formatTimeAgo } from '@/lib/utils';
import { useTelegramWebApp } from '@/lib/telegram';
import AppLayout from '@/components/layout/AppLayout';
import type { CoinDetails, ChartData, NewsItem, TechnicalIndicators } from '@/types';

interface ChartPeriod {
  label: string;
  days: number;
  interval: string;
}

const chartPeriods: ChartPeriod[] = [
  { label: '1D', days: 1, interval: 'hourly' },
  { label: '7D', days: 7, interval: 'hourly' },
  { label: '30D', days: 30, interval: 'daily' },
  { label: '90D', days: 90, interval: 'daily' },
  { label: '1Y', days: 365, interval: 'daily' },
];

export default function CoinDetailsPage() {
  const params = useParams();
  const coinId = params.id as string;
  
  const [coin, setCoin] = useState<CoinDetails | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(chartPeriods[1]); // 7D default
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'news'>('overview');

  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    if (coinId) {
      loadCoinData();
      loadChartData(selectedPeriod);
      checkFavoriteStatus();
    }
  }, [coinId]);

  useEffect(() => {
    if (selectedPeriod) {
      loadChartData(selectedPeriod);
    }
  }, [selectedPeriod]);

  const loadCoinData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coinData, newsData] = await Promise.all([
        coinGeckoService.getCoinDetails(coinId),
        cryptoPanicService.getCoinNews(coinId.toUpperCase()),
      ]);

      setCoin(coinData);
      setNews(newsData.slice(0, 10)); // Show latest 10 news items

      // Load technical analysis for major coins
      if (['bitcoin', 'ethereum', 'binancecoin'].includes(coinId)) {
        try {
          const symbolMap: { [key: string]: string } = {
            bitcoin: 'BTCUSDT',
            ethereum: 'ETHUSDT',
            binancecoin: 'BNBUSDT',
          };
          const symbol = symbolMap[coinId];
          if (symbol) {
            const techData = await technicalAnalysisService.getTechnicalIndicators(symbol);
            setTechnicalData(techData);
          }
        } catch (techError) {
          console.error('Failed to load technical data:', techError);
        }
      }
    } catch (err) {
      setError('Failed to load coin data');
      console.error('Error loading coin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (period: ChartPeriod) => {
    try {
      setChartLoading(true);
      const data = await coinGeckoService.getCoinHistory(coinId, period.days, period.interval);
      
      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleTimeString(),
      }));

      setChartData(formattedData);
    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('cryptoquiver_favorites') || '[]');
    setIsFavorite(favorites.includes(coinId));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('cryptoquiver_favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== coinId)
      : [...favorites, coinId];
    
    localStorage.setItem('cryptoquiver_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    // Telegram WebApp haptic feedback
    webApp?.selectionFeedback();
  };

  const handlePeriodChange = (period: ChartPeriod) => {
    setSelectedPeriod(period);
    // Telegram WebApp haptic feedback
    webApp?.selectionFeedback();
  };

  const renderTechnicalAnalysis = () => {
    if (!technicalData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* RSI */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">RSI (14)</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {technicalData.rsi.toFixed(1)}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                technicalData.rsi > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                technicalData.rsi < 30 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {technicalData.rsi > 70 ? 'Overbought' : technicalData.rsi < 30 ? 'Oversold' : 'Neutral'}
              </span>
            </div>
          </div>

          {/* MACD */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">MACD</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>MACD:</span>
                <span className="font-medium">{technicalData.macd.macd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Signal:</span>
                <span className="font-medium">{technicalData.macd.signal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Histogram:</span>
                <span className={`font-medium ${technicalData.macd.histogram >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {technicalData.macd.histogram.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Moving Averages */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Moving Averages</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>SMA 20:</span>
                <span className="font-medium">{formatPrice(technicalData.moving_averages.sma_20)}</span>
              </div>
              <div className="flex justify-between">
                <span>SMA 50:</span>
                <span className="font-medium">{formatPrice(technicalData.moving_averages.sma_50)}</span>
              </div>
              <div className="flex justify-between">
                <span>EMA 20:</span>
                <span className="font-medium">{formatPrice(technicalData.moving_averages.ema_20)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNews = () => {
    if (news.length === 0) {
      return (
        <div className="text-center py-8">
          <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No recent news found for this coin.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {news.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {article.title}
              </h3>
              <span className="flex-shrink-0 ml-2 text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(article.published_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{article.source.title}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-green-600">👍 {article.votes.positive}</span>
                  <span className="text-red-600">👎 {article.votes.negative}</span>
                </div>
              </div>
              
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => webApp?.impactFeedback('light')}
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                Read more
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !coin) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {error || 'Coin not found'}
          </h3>
          <Link
            href="/coins"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to coins
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/coins"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to coins
          </Link>
          
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isFavorite ? (
              <StarIconSolid className="h-6 w-6 text-yellow-500" />
            ) : (
              <StarIcon className="h-6 w-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* Coin Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <img src={coin.image} alt={coin.name} className="h-16 w-16" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {coin.name}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 uppercase font-medium">
                  {coin.symbol}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Rank #{coin.market_cap_rank}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(coin.market_data.current_price.usd)}
              </div>
              <div className={`text-lg ${getPercentageColor(coin.market_data.price_change_percentage_24h)}`}>
                {formatPercentage(coin.market_data.price_change_percentage_24h)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatMarketCap(coin.market_data.market_cap.usd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatMarketCap(coin.market_data.total_volume.usd)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">7d Change:</span>
                <span className={`text-sm font-medium ${getPercentageColor(coin.market_data.price_change_percentage_7d)}`}>
                  {formatPercentage(coin.market_data.price_change_percentage_7d)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">30d Change:</span>
                <span className={`text-sm font-medium ${getPercentageColor(coin.market_data.price_change_percentage_30d)}`}>
                  {formatPercentage(coin.market_data.price_change_percentage_30d)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
              Price Chart
            </h2>
            
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartPeriods.map((period) => (
                <button
                  key={period.label}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedPeriod.label === period.label
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => formatPrice(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any) => [formatPrice(value), 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'analysis', label: 'Technical Analysis' },
                { id: 'news', label: 'News' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  About {coin.name}
                </h3>
                <div 
                  className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: coin.description?.en || 'No description available.' }}
                />
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Analysis
                </h3>
                {technicalData ? renderTechnicalAnalysis() : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Technical analysis not available for this coin.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'news' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Latest News
                </h3>
                {renderNews()}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
