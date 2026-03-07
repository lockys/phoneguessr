import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { AuthProvider } from '../lib/auth-context';
import '../i18n';

export default function Layout() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <div>
        <Outlet />
      </div>
    </AuthProvider>
  );
}
