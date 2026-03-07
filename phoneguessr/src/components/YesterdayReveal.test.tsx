import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { YesterdayReveal } from './YesterdayReveal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockData = {
  phone: {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    releaseYear: 2023,
  },
  imageData: 'data:image/jpeg;base64,abc123',
  facts: ['First phone with titanium frame', 'Features the A17 Pro chip'],
  stats: {
    totalPlayers: 142,
    avgGuesses: 3.4,
    winRate: 68,
  },
};

// Mock IntersectionObserver (not available in jsdom)
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Fire callback asynchronously to avoid issues during React commit phase
    Promise.resolve().then(() => {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    });
  }
  unobserve() {}
  disconnect() {}
  get root() {
    return null;
  }
  get rootMargin() {
    return '';
  }
  get thresholds() {
    return [];
  }
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

describe('YesterdayReveal', () => {
  it('renders phone info when data loads successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    });
  });

  it('renders image with correct alt text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      const img = screen.getByAltText('Apple iPhone 15 Pro');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,abc123');
    });
  });

  it('renders fun facts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(
        screen.getByText('First phone with titanium frame'),
      ).toBeInTheDocument();
      expect(screen.getByText('Features the A17 Pro chip')).toBeInTheDocument();
    });
  });

  it('renders community stats', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(screen.getByText('142')).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
      expect(screen.getByText('3.4')).toBeInTheDocument();
    });
  });

  it('renders release year when available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  it('renders nothing when API returns error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ error: 'no_yesterday_puzzle' }),
    } as Response);

    const { container } = render(<YesterdayReveal />);

    await waitFor(() => {
      expect(container.querySelector('.yesterday')).not.toBeInTheDocument();
    });
  });

  it('renders nothing when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const { container } = render(<YesterdayReveal />);

    await waitFor(() => {
      expect(container.querySelector('.yesterday')).not.toBeInTheDocument();
    });
  });

  it('hides facts section when no facts provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ ...mockData, facts: [] }),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    expect(screen.queryByText('yesterday.funFacts')).not.toBeInTheDocument();
  });

  it('uses correct i18n keys', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    render(<YesterdayReveal />);

    await waitFor(() => {
      expect(screen.getByText('yesterday.title')).toBeInTheDocument();
      expect(screen.getByText('yesterday.funFacts')).toBeInTheDocument();
      expect(screen.getByText('yesterday.communityStats')).toBeInTheDocument();
      expect(screen.getByText('yesterday.players')).toBeInTheDocument();
      expect(screen.getByText('yesterday.winRate')).toBeInTheDocument();
      expect(screen.getByText('yesterday.avgGuesses')).toBeInTheDocument();
    });
  });
});
