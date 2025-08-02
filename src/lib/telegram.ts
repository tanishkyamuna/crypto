import type { TelegramWebApp } from '@/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

class TelegramWebAppManager {
  private webApp: TelegramWebApp | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isInitialized = true;
      this.webApp.ready();
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    if (!this.webApp) return;

    // Handle theme changes
    this.webApp.onEvent?.('themeChanged', () => {
      this.updateTheme();
    });

    // Handle viewport changes
    this.webApp.onEvent?.('viewportChanged', (data: any) => {
      this.handleViewportChange(data);
    });
  }

  get isAvailable(): boolean {
    return this.isInitialized && this.webApp !== null;
  }

  get user() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  get colorScheme() {
    return this.webApp?.colorScheme || 'light';
  }

  get themeParams() {
    return this.webApp?.themeParams || {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#3390ec',
      button_color: '#3390ec',
      button_text_color: '#ffffff',
      secondary_bg_color: '#f1f1f1',
    };
  }

  get version() {
    return this.webApp?.version || '6.0';
  }

  get platform() {
    return this.webApp?.platform || 'unknown';
  }

  get isExpanded() {
    return this.webApp?.isExpanded || false;
  }

  get viewportHeight() {
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  get viewportStableHeight() {
    return this.webApp?.viewportStableHeight || window.innerHeight;
  }

  // Main Button methods
  showMainButton(text: string, onClick: () => void) {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.onClick(onClick);
    this.webApp.MainButton.show();
  }

  hideMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hide();
  }

  setMainButtonText(text: string) {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.setText(text);
  }

  enableMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.enable();
  }

  disableMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.disable();
  }

  showMainButtonProgress() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.showProgress();
  }

  hideMainButtonProgress() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hideProgress();
  }

  // Back Button methods
  showBackButton(onClick: () => void) {
    if (!this.webApp?.BackButton) return;
    this.webApp.BackButton.onClick(onClick);
    this.webApp.BackButton.show();
  }

  hideBackButton() {
    if (!this.webApp?.BackButton) return;
    this.webApp.BackButton.hide();
  }

  // Haptic Feedback
  impactFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    if (!this.webApp?.HapticFeedback) return;
    this.webApp.HapticFeedback.impactOccurred(style);
  }

  notificationFeedback(type: 'error' | 'success' | 'warning') {
    if (!this.webApp?.HapticFeedback) return;
    this.webApp.HapticFeedback.notificationOccurred(type);
  }

  selectionFeedback() {
    if (!this.webApp?.HapticFeedback) return;
    this.webApp.HapticFeedback.selectionChanged();
  }

  // App Control
  expand() {
    if (!this.webApp) return;
    this.webApp.expand();
  }

  close() {
    if (!this.webApp) return;
    this.webApp.close();
  }

  // Theme and styling
  private updateTheme() {
    if (!this.webApp) return;

    const root = document.documentElement;
    const themeParams = this.webApp.themeParams;

    // Update CSS custom properties
    root.style.setProperty('--tg-bg-color', themeParams.bg_color);
    root.style.setProperty('--tg-text-color', themeParams.text_color);
    root.style.setProperty('--tg-hint-color', themeParams.hint_color);
    root.style.setProperty('--tg-link-color', themeParams.link_color);
    root.style.setProperty('--tg-button-color', themeParams.button_color);
    root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
    root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color);

    // Update body background
    document.body.style.backgroundColor = themeParams.bg_color;
    document.body.style.color = themeParams.text_color;
  }

  private handleViewportChange(data: any) {
    // Handle viewport changes if needed
    console.log('Viewport changed:', data);
  }

  // Data validation and security
  validateInitData(): boolean {
    if (!this.webApp?.initData) return false;
    
    // In a real app, you would validate the hash using your bot's secret key
    // This is a simplified validation
    return this.webApp.initData.length > 0;
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }

  getUser() {
    if (!this.validateInitData()) return null;
    return this.webApp?.initDataUnsafe?.user || null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  getUsername(): string | null {
    const user = this.getUser();
    return user?.username || null;
  }

  getFirstName(): string | null {
    const user = this.getUser();
    return user?.first_name || null;
  }

  getLastName(): string | null {
    const user = this.getUser();
    return user?.last_name || null;
  }

  getLanguageCode(): string {
    const user = this.getUser();
    return user?.language_code || 'en';
  }

  isPremiumUser(): boolean {
    const user = this.getUser();
    return user?.is_premium || false;
  }

  // Sharing and external links
  openLink(url: string, options?: { try_instant_view?: boolean }) {
    if (!this.webApp) {
      window.open(url, '_blank');
      return;
    }

    this.webApp.openLink?.(url, options);
  }

  openTelegramLink(url: string) {
    if (!this.webApp) {
      window.open(url, '_blank');
      return;
    }

    this.webApp.openTelegramLink?.(url);
  }

  // Cloud storage (if available)
  setCloudStorageItem(key: string, value: string, callback?: (error: string | null) => void) {
    if (!this.webApp?.CloudStorage) {
      callback?.('Cloud storage not available');
      return;
    }

    this.webApp.CloudStorage.setItem(key, value, callback);
  }

  getCloudStorageItem(key: string, callback: (error: string | null, value?: string) => void) {
    if (!this.webApp?.CloudStorage) {
      callback('Cloud storage not available');
      return;
    }

    this.webApp.CloudStorage.getItem(key, callback);
  }

  removeCloudStorageItem(key: string, callback?: (error: string | null) => void) {
    if (!this.webApp?.CloudStorage) {
      callback?.('Cloud storage not available');
      return;
    }

    this.webApp.CloudStorage.removeItem(key, callback);
  }

  // Biometric authentication (if available)
  requestBiometricAuth(reason: string, callback: (success: boolean) => void) {
    if (!this.webApp?.BiometricManager) {
      callback(false);
      return;
    }

    this.webApp.BiometricManager.authenticate(
      { reason },
      (success: boolean) => callback(success)
    );
  }

  // QR Code scanner (if available)
  showScanQrPopup(text: string, callback: (data: string | null) => void) {
    if (!this.webApp?.showScanQrPopup) {
      callback(null);
      return;
    }

    this.webApp.showScanQrPopup({ text }, (data: string) => {
      callback(data);
    });
  }

  closeScanQrPopup() {
    if (!this.webApp?.closeScanQrPopup) return;
    this.webApp.closeScanQrPopup();
  }

  // Utility methods
  isInTelegramApp(): boolean {
    return this.isAvailable && this.webApp !== null;
  }

  isMobile(): boolean {
    return ['android', 'ios'].includes(this.platform.toLowerCase());
  }

  isDesktop(): boolean {
    return ['web', 'tdesktop', 'macos', 'windows', 'linux'].includes(this.platform.toLowerCase());
  }

  // Development helpers
  mockTelegramEnvironment() {
    if (process.env.NODE_ENV === 'development' && !this.isAvailable) {
      // Mock Telegram WebApp for development
      this.webApp = {
        initData: 'mock_init_data',
        initDataUnsafe: {
          query_id: 'mock_query',
          user: {
            id: 123456789,
            first_name: 'John',
            last_name: 'Doe',
            username: 'johndoe',
            language_code: 'en',
            is_premium: false,
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'mock_hash',
        },
        version: '6.0',
        platform: 'web',
        colorScheme: 'light',
        themeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#3390ec',
          button_color: '#3390ec',
          button_text_color: '#ffffff',
          secondary_bg_color: '#f1f1f1',
        },
        isExpanded: false,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        isClosingConfirmationEnabled: false,
        headerColor: '#ffffff',
        backgroundColor: '#ffffff',
        BackButton: {
          isVisible: false,
          show: () => {},
          hide: () => {},
          onClick: () => {},
          offClick: () => {},
        },
        MainButton: {
          text: '',
          color: '#3390ec',
          textColor: '#ffffff',
          isVisible: false,
          isProgressVisible: false,
          isActive: true,
          setText: () => {},
          onClick: () => {},
          offClick: () => {},
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          showProgress: () => {},
          hideProgress: () => {},
          setParams: () => {},
        },
        HapticFeedback: {
          impactOccurred: () => {},
          notificationOccurred: () => {},
          selectionChanged: () => {},
        },
        close: () => {},
        expand: () => {},
        ready: () => {},
      } as TelegramWebApp;

      this.isInitialized = true;
      this.updateTheme();
    }
  }
}

// Create singleton instance
export const telegramWebApp = new TelegramWebAppManager();

// React hook for Telegram WebApp
export function useTelegramWebApp() {
  return {
    webApp: telegramWebApp,
    isAvailable: telegramWebApp.isAvailable,
    user: telegramWebApp.getUser(),
    colorScheme: telegramWebApp.colorScheme,
    themeParams: telegramWebApp.themeParams,
    platform: telegramWebApp.platform,
    version: telegramWebApp.version,
  };
}

// Initialize in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  telegramWebApp.mockTelegramEnvironment();
}
