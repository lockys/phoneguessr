// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock CSS import
vi.mock('./install-prompt.css', () => ({}));

// getDeferredPrompt is exported from layout — mock it here
const mockGetDeferredPrompt = vi.fn();
vi.mock('../routes/layout', () => ({
  getDeferredPrompt: mockGetDeferredPrompt,
}));

const { InstallPrompt } = await import('./InstallPrompt');

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetDeferredPrompt.mockReturnValue(null);
    // Default: not standalone
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    // Reset userAgent in case an iOS test set it
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0',
    });
  });

  it('does not render when phoneguessr_install_eligible is not set', () => {
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('does not render when already dismissed', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('does not render when already in standalone mode', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }), // standalone = true
    });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('renders Android banner when eligible and deferredPrompt available', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.getByText(/add phoneguessr/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /install/i })).toBeDefined();
  });

  it('clicking Install calls deferredPrompt.prompt and sets dismissed', async () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    const mockPrompt = vi.fn().mockResolvedValue({ outcome: 'accepted' });
    mockGetDeferredPrompt.mockReturnValue({ prompt: mockPrompt });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /install/i }));
    expect(mockPrompt).toHaveBeenCalledOnce();
    await vi.waitFor(() => {
      expect(localStorage.getItem('phoneguessr_install_dismissed')).toBe(
        'true',
      );
    });
  });

  it('renders iOS share instruction on iOS (no deferredPrompt)', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue(null);
    // Simulate iOS userAgent
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    });
    render(<InstallPrompt />);
    expect(screen.getByText(/add to home screen/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /install/i })).toBeNull();
  });
});
