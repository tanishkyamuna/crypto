'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { coinGeckoService } from '@/lib/api';
import { formatPrice, formatPercentage, getPercentageColor, formatMarketCap, debounce } from '@/lib/utils';
import { useTelegramWebApp } from '@/lib/telegram';
import AppLayout from '@/components/layout/AppLayout';
import type { Coin } from '@/types';

interface SortConfig {
  key: keyof Coin | 'market_cap_rank';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  showFavorites: boolean;
}

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'market_cap_rank',
    direction: 'asc',
  });
  
  const [filters, setFilters] = useState<FilterConfig>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    showFavorites: false,
  });

  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    loadCoins(1, true);
    loadFavorites();
  }, []);

  useEffect(() => {
    const debouncedFilter = debounce(() => {
      applyFiltersAndSort();
    }, 300);

    debouncedFilter();
  }, [coins, filters, sortConfig]);

  const loadCoins = async (pageNum: number, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const newCoins = await coinGeckoService.getCoins(pageNum, 50);
      
      if (newCoins.length === 0) {
        setHasMore(false);
      } else {
        if (reset) {
          setCoins(newCoins);
          setPage(2);
        } else {
          setCoins(prev => [...prev, ...newCoins]);
          setPage(pageNum + 1);
        }
      }
    } catch (err) {
      setError('Failed to load coins data');
      console.error('Error loading coins:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadFavorites = async () => {
    // In a real app, load from local storage or API
    const stored = localStorage.getItem('cryptoquiver_favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  };

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('cryptoquiver_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const toggleFavorite = (coinId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(coinId)) {
      newFavorites.delete(coinId);
    } else {
      newFavorites.add(coinId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
    webApp?.HapticFeedback.selectionChanged();
  };

  const applyFiltersAndSort = () => {
    let filtered = [...coins];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(coin =>
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(coin => coin.current_price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(coin => coin.current_price <= maxPrice);
    }

    // Apply favorites filter
    if (filters.showFavorites) {
      filtered = filtered.filter(coin => favorites.has(coin.id));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key] as any;
      let bValue = b[sortConfig.key] as any;

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? result : -result;
    });

    setFilteredCoins(filtered);
  };

  const handleSort = (key: keyof Coin | 'market_cap_rank') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    webApp?.HapticFeedback.selectionChanged();
  };

  const handleFilterChange = (key: keyof FilterConfig, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadCoins(page);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'decentralized-finance-defi', label: 'DeFi' },
    { value: 'layer-1', label: 'Layer 1' },
    { value: 'meme-token', label: 'Meme Coins' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'metaverse', label: 'Metaverse' },
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cryptocurrencies
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {filteredCoins.length} coins • Updated in real-time
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

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="0.00"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="0.00"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Favorites Filter */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="favorites-filter"
                      checked={filters.showFavorites}
                      onChange={(e) => handleFilterChange('showFavorites', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="favorites-filter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Show only favorites
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Coins Table */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => handleSort('market_cap_rank')}
                className="flex items-center space-x-1 text-left hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>#</span>
                {sortConfig.key === 'market_cap_rank' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('name')}
                className="flex items-center space-x-1 text-left hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Name</span>
                {sortConfig.key === 'name' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('current_price')}
                className="flex items-center space-x-1 text-right hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Price</span>
                {sortConfig.key === 'current_price' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('price_change_percentage_24h')}
                className="flex items-center space-x-1 text-right hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>24h %</span>
                {sortConfig.key === 'price_change_percentage_24h' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('market_cap')}
                className="flex items-center space-x-1 text-right hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Market Cap</span>
                {sortConfig.key === 'market_cap' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredCoins.map((coin, index) => (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* Rank & Favorite */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                        {coin.market_cap_rank}
                      </span>
                      <button
                        onClick={() => toggleFavorite(coin.id)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        {favorites.has(coin.id) ? (
                          <StarIconSolid className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Name & Symbol */}
                    <Link
                      href={`/coins/${coin.id}`}
                      className="flex items-center space-x-3 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <img src={coin.image} alt={coin.name} className="h-8 w-8" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coin.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </Link>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPrice(coin.current_price)}
                      </div>
                    </div>

                    {/* 24h Change */}
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPercentageColor(coin.price_change_percentage_24h)}`}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </div>
                    </div>

                    {/* Market Cap */}
                    <div className="text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatMarketCap(coin.market_cap)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMore && !filters.search && !filters.showFavorites && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredCoins.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No coins found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          </div>
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
