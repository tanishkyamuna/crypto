'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  CurrencyDollarIcon,
  StarIcon,
  FireIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { coinGeckoService } from '@/lib/api';
import { formatPrice, formatPercentage, getPercentageColor, formatMarketCap } from '@/lib/utils';
import { useTelegramWebApp } from '@/lib/telegram';
import AppLayout from '@/components/layout/AppLayout';
import type { Coin } from '@/types';

interface GlobalData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export default function HomePage() {
  const [trendingCoins, setTrendingCoins] = useState<Coin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAvailable } = useTelegramWebApp();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coinsData, globalResponse] = await Promise.all([
        coinGeckoService.getCoins(1, 10, undefined, 'market_cap_desc'),
        coinGeckoService.getGlobalData(),
      ]);

      setTrendingCoins(coinsData);
      setGlobalData(globalResponse.data);
    } catch (err) {
      setError('Failed to load market data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      name: 'Live Market Data',
      description: 'Real-time prices and market data for thousands of cryptocurrencies',
      icon: CurrencyDollarIcon,
      href: '/coins',
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
    },
    {
      name: 'Technical Analysis',
      description: 'Advanced charts with technical indicators and trading signals',
      icon: ChartBarIcon,
      href: '/signals',
      premium: true,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/25',
    },
    {
      name: 'Price Alerts',
      description: 'Get notified when your favorite coins hit target prices',
      icon: BellIcon,
      href: '/account',
      premium: true,
      gradient: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/25',
    },
    {
      name: 'CPA Rewards',
      description: 'Earn premium access by completing simple tasks',
      icon: SparklesIcon,
      href: '/cpa',
      gradient: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/25',
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 animate-pulse"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-20">
        {/* Hero Section with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl p-8"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-success-400/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/25 mb-4">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent sm:text-5xl mb-4">
              Welcome to CryptoQuiver
              {user && (
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="block text-2xl font-medium text-primary-600 dark:text-primary-400 mt-2"
                >
                  Hello, {user.first_name}! 👋
                </motion.span>
              )}
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Your comprehensive crypto trading companion in Telegram. Real-time data, advanced analytics, and premium insights.
            </motion.p>
          </div>
        </motion.div>

        {/* Global Market Stats */}
        {globalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Market Cap
                      </dt>
                      <dd className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatMarketCap(globalData.total_market_cap.usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-shadow">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        24h Volume
                      </dt>
                      <dd className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatMarketCap(globalData.total_volume.usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                      <span className="text-white font-bold text-lg">₿</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        BTC Dominance
                      </dt>
                      <dd className="text-xl font-bold text-gray-900 dark:text-white">
                        {globalData.market_cap_percentage.btc.toFixed(1)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-shadow ${
                      globalData.market_cap_change_percentage_24h_usd >= 0 
                        ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-500/25 group-hover:shadow-success-500/40' 
                        : 'bg-gradient-to-br from-error-500 to-error-600 shadow-error-500/25 group-hover:shadow-error-500/40'
                    }`}>
                      {globalData.market_cap_change_percentage_24h_usd >= 0 ? (
                        <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        24h Change
                      </dt>
                      <dd className={`text-xl font-bold ${getPercentageColor(globalData.market_cap_change_percentage_24h_usd)}`}>
                        {formatPercentage(globalData.market_cap_change_percentage_24h_usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className={`h-1 ${
                globalData.market_cap_change_percentage_24h_usd >= 0 
                  ? 'bg-gradient-to-r from-success-500 to-success-600' 
                  : 'bg-gradient-to-r from-error-500 to-error-600'
              }`}></div>
            </motion.div>
          </motion.div>
        )}

        {/* Top Coins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <StarIcon className="w-6 h-6 text-yellow-500 mr-2" />
                Top Cryptocurrencies
              </h2>
              <Link
                href="/coins"
                className="inline-flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors font-medium"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {trendingCoins.slice(0, 5).map((coin, index) => (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Link
                    href={`/coins/${coin.id}`}
                    className="block p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img className="h-12 w-12 rounded-xl" src={coin.image} alt={coin.name} />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {coin.name}
                            </div>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md uppercase">
                              {coin.symbol}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Market Cap: {formatMarketCap(coin.market_cap)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(coin.current_price)}
                        </div>
                        <div className={`text-sm font-medium ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <SparklesIcon className="w-6 h-6 text-primary-500 mr-2" />
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Link
                    href={feature.href}
                    className={`relative block bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-transparent ${feature.glow && `hover:shadow-2xl hover:${feature.glow}`}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg ${feature.glow} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {feature.name}
                          </h3>
                          {feature.premium && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                              ⭐ Premium
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-8 text-center text-white shadow-2xl shadow-primary-500/25"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to Start Trading?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of traders using CryptoQuiver for real-time market insights and advanced trading tools.
            </p>
            <button className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
              Get Started Now
              <ArrowTrendingUpIcon className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
          >
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
