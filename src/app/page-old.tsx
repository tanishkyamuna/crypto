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
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Market Change
                      </dt>
                      <dd className={`text-lg font-medium ${getPercentageColor(globalData.market_cap_change_percentage_24h_usd)}`}>
                        {formatPercentage(globalData.market_cap_change_percentage_24h_usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Coins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Cryptocurrencies</h2>
            <Link
              href="/coins"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {trendingCoins.slice(0, 5).map((coin, index) => (
                <motion.li
                  key={coin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={`/coins/${coin.id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img className="h-10 w-10" src={coin.image} alt={coin.name} />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {coin.name}
                            </div>
                            <div className="ml-2 text-sm text-gray-500 dark:text-gray-400 uppercase">
                              {coin.symbol}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Rank #{coin.market_cap_rank}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(coin.current_price)}
                        </div>
                        <div className={`text-sm ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    href={feature.href}
                    className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 ring-4 ring-white dark:ring-gray-800">
                        <IconComponent className="h-6 w-6" aria-hidden="true" />
                      </span>
                      {feature.premium && (
                        <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {feature.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                    <span
                      className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500"
                      aria-hidden="true"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H5v2h10.586l-4.293 4.293z" />
                      </svg>
                    </span>
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
            className="bg-blue-50 dark:bg-blue-900 rounded-lg p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ready to start trading?
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Get premium access to advanced features and trading signals.
            </p>
            <div className="mt-6">
              <Link
                href="/account"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
            <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
