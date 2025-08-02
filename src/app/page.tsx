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
    },
    {
      name: 'Technical Analysis',
      description: 'Advanced charts with technical indicators and trading signals',
      icon: ChartBarIcon,
      href: '/signals',
      premium: true,
    },
    {
      name: 'Price Alerts',
      description: 'Get notified when your favorite coins hit target prices',
      icon: BellIcon,
      href: '/account',
      premium: true,
    },
    {
      name: 'CPA Rewards',
      description: 'Earn premium access by completing simple tasks',
      icon: SparklesIcon,
      href: '/cpa',
    },
  ];

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
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Welcome to CryptoQuiver
            {user && (
              <span className="block text-2xl font-normal text-gray-600 dark:text-gray-300 mt-2">
                Hello, {user.first_name}! 👋
              </span>
            )}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Your comprehensive crypto trading companion in Telegram
          </p>
        </motion.div>

        {/* Global Market Stats */}
        {globalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Market Cap
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatMarketCap(globalData.total_market_cap.usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        24h Volume
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatMarketCap(globalData.total_volume.usd)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        BTC Dominance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {globalData.market_cap_percentage.btc.toFixed(1)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      globalData.market_cap_change_percentage_24h_usd >= 0 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}>
                      {globalData.market_cap_change_percentage_24h_usd >= 0 ? (
                        <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
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
