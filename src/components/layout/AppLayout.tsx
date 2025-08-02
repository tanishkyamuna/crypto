'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTelegramWebApp } from '@/lib/telegram';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  premium?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Coins',
    href: '/coins',
  },
  {
    name: 'Signals',
    href: '/signals',
    premium: true,
  },
  {
    name: 'CPA',
    href: '/cpa',
  },
  {
    name: 'Account',
    href: '/account',
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { webApp, isAvailable, themeParams, colorScheme, user } = useTelegramWebApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only apply Telegram styles after mount to prevent hydration issues
    if (mounted && isAvailable) {
      document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color);
      document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color);
      document.body.style.backgroundColor = themeParams.bg_color;
      document.body.style.color = themeParams.text_color;
    }
  }, [mounted, isAvailable, themeParams]);

  const isActive = (href: string) => pathname === href;

  const handleNavigation = (href: string) => {
    if (mounted && webApp) {
      webApp.selectionFeedback();
    }
  };

  return (
    <div className={cn(
      'min-h-screen',
      colorScheme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'
    )}>
      {/* Mobile header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
        <div className="flex-1 text-xl font-bold leading-6 text-gray-900 dark:text-white">
          CryptoQuiver
        </div>
        {mounted && user && (
          <div className="flex items-center gap-x-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.first_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Page content */}
      <main className="p-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const isCurrentPage = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs rounded-lg transition-all',
                  isCurrentPage
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <div className="relative">
                  <div className="h-6 w-6 mb-1 bg-gray-400 rounded"></div>
                  {item.premium && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      P
                    </div>
                  )}
                </div>
                <span className="truncate leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
