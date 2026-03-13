import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.signIn': 'Sign in with Google',
        'auth.signOut': 'Sign out',
        'auth.error': 'Login failed',
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockLogin = vi.fn();
const mockLogout = vi.fn();
let mockAuth = {
  user: null as { id: number; displayName: string; avatarUrl?: string } | null,
  loading: false,
  login: mockLogin,
  logout: mockLogout,
};

vi.mock('../lib/auth-context', () => ({
  useAuth: () => mockAuth,
}));

// Must import after vi.mock calls
const { AuthButton } = await import('./AuthButton');

describe('AuthButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAuth = {
      user: null,
      loading: false,
      login: mockLogin,
      logout: mockLogout,
    };
    mockLogin.mockClear();
    mockLogout.mockClear();
    // Reset URL to clean state
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('loading state', () => {
    it('renders nothing while loading', () => {
      mockAuth.loading = true;
      const { container } = render(<AuthButton />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('signed-out state', () => {
    it('renders sign-in button', () => {
      render(<AuthButton />);
      expect(
        screen.getByRole('button', { name: 'Sign in with Google' }),
      ).toBeInTheDocument();
    });

    it('calls login on sign-in click', () => {
      render(<AuthButton />);
      fireEvent.click(
        screen.getByRole('button', { name: 'Sign in with Google' }),
      );
      expect(mockLogin).toHaveBeenCalledOnce();
    });
  });

  describe('signed-in state', () => {
    beforeEach(() => {
      mockAuth.user = {
        id: 1,
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
    });

    it('renders avatar, name, and sign-out button', () => {
      const { container } = render(<AuthButton />);
      const avatar = container.querySelector('.auth-avatar');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Sign out' }),
      ).toBeInTheDocument();
    });

    it('omits avatar when avatarUrl is missing', () => {
      mockAuth.user = { id: 1, displayName: 'No Avatar' };
      render(<AuthButton />);
      expect(screen.queryByRole('img')).toBeNull();
      expect(screen.getByText('No Avatar')).toBeInTheDocument();
    });

    it('calls logout on sign-out click', () => {
      render(<AuthButton />);
      fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
      expect(mockLogout).toHaveBeenCalledOnce();
    });
  });

  describe('auth error from URL', () => {
    it('displays error message when URL has error param', () => {
      window.history.replaceState({}, '', '/?error=access_denied');
      render(<AuthButton />);
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });

    it('cleans up the URL after detecting error', () => {
      window.history.replaceState({}, '', '/?error=access_denied');
      render(<AuthButton />);
      expect(window.location.search).toBe('');
    });

    it('auto-clears error after 5 seconds', () => {
      window.history.replaceState({}, '', '/?error=access_denied');
      render(<AuthButton />);
      expect(screen.getByText('Login failed')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Login failed')).toBeNull();
    });
  });
});
