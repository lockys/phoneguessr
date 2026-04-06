/// <reference types='@modern-js/app-tools/types' />

interface TelegramWebApp {
  version: string;
  platform: string;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready(): void;
  expand(): void;
  close(): void;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
    offClick(fn: () => void): void;
  };
  MainButton: {
    text: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    onClick(fn: () => void): void;
    offClick(fn: () => void): void;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
