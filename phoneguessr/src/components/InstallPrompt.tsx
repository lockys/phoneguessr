import { useEffect, useState } from 'react';
import { getDeferredPrompt } from '../routes/layout';
import './install-prompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function shouldShow(deferredPrompt: BeforeInstallPromptEvent | null): boolean {
  if (isStandalone()) return false;
  if (localStorage.getItem('phoneguessr_install_dismissed') === 'true')
    return false;
  if (localStorage.getItem('phoneguessr_install_eligible') !== 'true')
    return false;
  return deferredPrompt !== null || isIos();
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const check = () => {
      const dp = getDeferredPrompt() as BeforeInstallPromptEvent | null;
      setPrompt(dp);
      setVisible(shouldShow(dp));
    };

    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    try {
      await prompt.prompt();
    } catch {
      // ignore — hide regardless
    }
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" role="banner">
      {isIos() ? (
        <p className="install-prompt-text">
          📱 Tap ⎙ then &ldquo;Add to Home Screen&rdquo; to install
        </p>
      ) : (
        <>
          <p className="install-prompt-text">
            📱 Add PhoneGuessr to your home screen
          </p>
          <button
            type="button"
            className="install-prompt-install"
            onClick={handleInstall}
          >
            Install
          </button>
        </>
      )}
      <button
        type="button"
        className="install-prompt-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
