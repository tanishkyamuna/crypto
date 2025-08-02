'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PauseIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useTelegramWebApp } from '@/lib/telegram';
import { formatPrice, formatPercentage, getPercentageColor, formatTimeAgo } from '@/lib/utils';
import { SIGNAL_TYPES, STRATEGY_TYPES, RISK_LEVELS } from '@/config';
import AppLayout from '@/components/layout/AppLayout';
import type { TradingSignal } from '@/types';

interface FilterConfig {
  signal_type: string;
  strategy_type: string;
  risk_level: string;
  status: string;
}

// Mock data for trading signals
const mockSignals: TradingSignal[] = [
  {
    id: 'signal_1',
    coin_id: 'bitcoin',
    coin_symbol: 'BTC',
    coin_name: 'Bitcoin',
    signal_type: 'buy',
    strategy_type: 'swing',
    risk_level: 'medium',
    entry_price: 42000,
    target_price: 48000,
    stop_loss: 39000,
    confidence: 85,
    reasoning: 'Strong support at current levels, bullish RSI divergence, and institutional buying pressure.',
    created_at: '2024-08-01T10:00:00Z',
    expires_at: '2024-08-08T10:00:00Z',
    status: 'active',
    performance: {
      current_price: 44500,
      pnl_percentage: 5.95,
    },
  },
  {
    id: 'signal_2',
    coin_id: 'ethereum',
    coin_symbol: 'ETH',
    coin_name: 'Ethereum',
    signal_type: 'sell',
    strategy_type: 'day',
    risk_level: 'high',
    entry_price: 3200,
    target_price: 2850,
    stop_loss: 3350,
    confidence: 72,
    reasoning: 'Overbought conditions, resistance at $3200, and potential market correction.',
    created_at: '2024-08-01T14:30:00Z',
    expires_at: '2024-08-02T14:30:00Z',
    status: 'active',
    performance: {
      current_price: 3100,
      pnl_percentage: 3.13,
    },
  },
  {
    id: 'signal_3',
    coin_id: 'cardano',
    coin_symbol: 'ADA',
    coin_name: 'Cardano',
    signal_type: 'buy',
    strategy_type: 'long-term',
    risk_level: 'low',
    entry_price: 0.45,
    target_price: 0.65,
    stop_loss: 0.38,
    confidence: 90,
    reasoning: 'Undervalued after recent correction, upcoming network upgrades, and strong fundamentals.',
    created_at: '2024-07-28T09:15:00Z',
    expires_at: '2024-09-28T09:15:00Z',
    status: 'completed',
    performance: {
      current_price: 0.52,
      pnl_percentage: 15.56,
    },
  },
];

export default function SignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  const [filters, setFilters] = useState<FilterConfig>({
    signal_type: '',
    strategy_type: '',
    risk_level: '',
    status: '',
  });

  const { user, webApp } = useTelegramWebApp();

  useEffect(() => {
    loadSignals();
    checkSubscription();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [signals, filters]);

  const loadSignals = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      setTimeout(() => {
        setSignals(mockSignals);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load signals:', error);
      setLoading(false);
    }
  };

  const checkSubscription = () => {
    // In a real app, check user's subscription status
    const hasValidSubscription = localStorage.getItem('cryptoquiver_subscription') === 'active';
    setHasSubscription(hasValidSubscription);
  };

  const applyFilters = () => {
    let filtered = [...signals];

    if (filters.signal_type) {
      filtered = filtered.filter(signal => signal.signal_type === filters.signal_type);
    }

    if (filters.strategy_type) {
      filtered = filtered.filter(signal => signal.strategy_type === filters.strategy_type);
    }

    if (filters.risk_level) {
      filtered = filtered.filter(signal => signal.risk_level === filters.risk_level);
    }

    if (filters.status) {
      filtered = filtered.filter(signal => signal.status === filters.status);
    }

    setFilteredSignals(filtered);
  };

  const handleFilterChange = (key: keyof FilterConfig, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSignalIcon = (type: 'buy' | 'sell' | 'hold') => {
    switch (type) {
      case 'buy':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'sell':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'hold':
        return <PauseIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <ShieldCheckIcon className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <ShieldExclamationIcon className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const subscribeToPremium = () => {
    webApp?.HapticFeedback.impactOccurred('medium');
    // Navigate to subscription page or show modal
  };

  if (!hasSubscription) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <StarIcon className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Premium Feature
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Trading signals are available for premium subscribers only. 
              Get access to expert analysis and profitable trading opportunities.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                What you'll get:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-2" />
                  Expert trading signals with entry/exit points
                </li>
                <li className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                  Real-time notifications and alerts
                </li>
                <li className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  Risk management recommendations
                </li>
                <li className="flex items-center">
                  <BellIcon className="h-4 w-4 text-purple-500 mr-2" />
                  Performance tracking and analytics
                </li>
              </ul>
            </div>

            <Link
              href="/account"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
              onClick={subscribeToPremium}
            >
              <StarIcon className="h-5 w-5 mr-2" />
              Upgrade to Premium
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
              Trading Signals
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Expert trading recommendations and market analysis
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600">+24.5%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Return</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Signals</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Signals</div>
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Signal Type
                </label>
                <select
                  value={filters.signal_type}
                  onChange={(e) => handleFilterChange('signal_type', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                  <option value="hold">Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strategy
                </label>
                <select
                  value={filters.strategy_type}
                  onChange={(e) => handleFilterChange('strategy_type', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Strategies</option>
                  <option value="day">Day Trading</option>
                  <option value="swing">Swing Trading</option>
                  <option value="long-term">Long-term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Level
                </label>
                <select
                  value={filters.risk_level}
                  onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Signals List */}
        <div className="space-y-4">
          {filteredSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getSignalIcon(signal.signal_type)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {signal.coin_name} ({signal.coin_symbol})
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          {getRiskIcon(signal.risk_level)}
                          <span className="ml-1">{RISK_LEVELS[signal.risk_level].name}</span>
                        </span>
                        <span>{STRATEGY_TYPES[signal.strategy_type].name}</span>
                        <span>Confidence: {signal.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {signal.reasoning}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Entry:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formatPrice(signal.entry_price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Target:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatPrice(signal.target_price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Stop Loss:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {formatPrice(signal.stop_loss)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6 lg:text-right">
                  {signal.performance && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current P&L</div>
                      <div className={`text-lg font-semibold ${getPercentageColor(signal.performance.pnl_percentage)}`}>
                        {formatPercentage(signal.performance.pnl_percentage)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(signal.performance.current_price)}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      signal.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : signal.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
                    </span>
                    
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(signal.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSignals.length === 0 && (
          <div className="text-center py-12">
            <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No signals found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or check back later for new signals.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
