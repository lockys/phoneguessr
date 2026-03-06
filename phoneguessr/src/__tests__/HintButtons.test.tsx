import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HintButtons } from '../components/HintButtons';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'hint.brand': 'Brand',
        'hint.year': 'Year',
        'hint.price': 'Price',
        'hint.penaltyWarning': '+15s penalty per hint',
      };
      if (key === 'hint.used') {
        return `${params?.used}/${params?.max} hints used`;
      }
      return translations[key] || key;
    },
  }),
}));

// Mock web-haptics
const mockTrigger = vi.fn();
vi.mock('web-haptics/react', () => ({
  useWebHaptics: () => ({ trigger: mockTrigger }),
}));

describe('HintButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders three hint buttons', () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('shows penalty warning before any hints are used', () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    expect(screen.getByText('+15s penalty per hint')).toBeInTheDocument();
  });

  it('reveals brand hint in mock mode on click', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Samsung" />,
    );
    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      expect(screen.getByText('Brand: Samsung')).toBeInTheDocument();
    });
  });

  it('triggers haptic feedback on hint use', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith('light');
    });
  });

  it('shows hint counter after using a hint', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      expect(screen.getByText('1/2 hints used')).toBeInTheDocument();
    });
  });

  it('disables all buttons after 2 hints used', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      expect(screen.getByText('Brand: Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Year'));
    await waitFor(() => {
      expect(screen.getByText('Year: 2024')).toBeInTheDocument();
    });

    // Price button should be disabled
    const priceBtn = screen.getByText('Price');
    expect(priceBtn).toBeDisabled();
  });

  it('disables already-used hint button', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      const usedBtn = screen.getByText('Brand: Apple');
      expect(usedBtn).toBeDisabled();
    });
  });

  it('hides penalty warning after first hint', async () => {
    render(
      <HintButtons puzzleId={1} isMockMode={true} mockAnswerBrand="Apple" />,
    );
    expect(screen.getByText('+15s penalty per hint')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Brand'));
    await waitFor(() => {
      expect(
        screen.queryByText('+15s penalty per hint'),
      ).not.toBeInTheDocument();
    });
  });

  it('calls API in non-mock mode', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ hint: 'Google', penalty: 15 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<HintButtons puzzleId={42} isMockMode={false} />);
    fireEvent.click(screen.getByText('Brand'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId: 42, hintType: 'brand' }),
      });
    });

    vi.unstubAllGlobals();
  });
});
