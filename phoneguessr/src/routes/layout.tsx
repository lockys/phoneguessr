import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { InstallPrompt } from '../components/InstallPrompt';
import { AuthProvider } from '../lib/auth-context';
import '../i18n';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Module-scoped so it's captured before React hydrates child components.
// The 'beforeinstallprompt' event fires early in page lifecycle.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return _deferredPrompt;
}

export default function Layout() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const twa = window.Telegram?.WebApp;
    if (twa) {
      twa.ready();
      twa.expand();
    }
  }, []);

  return (
    <AuthProvider>
      <div>
        <Outlet />
        <InstallPrompt />
      </div>
    </AuthProvider>
  );
}
