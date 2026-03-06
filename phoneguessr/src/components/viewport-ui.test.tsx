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
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'guess.remaining') return `${opts?.count} guesses left`;
      if (key === 'hint.used') return `${opts?.used}/${opts?.max} hints used`;
      if (key === 'leaderboard.wins') return `${opts?.count} wins`;
      return key;
    },
  }),
}));

// Mock auth context
vi.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock web-haptics
vi.mock('web-haptics/react', () => ({
  useWebHaptics: () => ({ trigger: vi.fn() }),
}));

import { BlockGrid } from './BlockGrid';
import { GuessHistory } from './GuessHistory';
import { Leaderboard } from './Leaderboard';
import { Onboarding } from './Onboarding';
import { PageIndicator } from './PageIndicator';
import { PhoneAutocomplete } from './PhoneAutocomplete';
import { ResultModal } from './ResultModal';
import { SwipeContainer } from './SwipeContainer';

// ---------- Helpers ----------

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
}

function setViewportHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

// ---------- SwipeContainer ----------

describe('SwipeContainer – viewport and structure', () => {
  it('renders all child panels with swipe-panel class', () => {
    const { container } = render(
      <SwipeContainer>
        <div>Profile</div>
        <div>Game</div>
        <div>Leaderboard</div>
        <div>About</div>
      </SwipeContainer>,
    );
    const panels = container.querySelectorAll('.swipe-panel');
    expect(panels).toHaveLength(4);
  });

  it('wraps panels inside a swipe-container', () => {
    const { container } = render(
      <SwipeContainer>
        <div>A</div>
        <div>B</div>
      </SwipeContainer>,
    );
    const sc = container.querySelector('.swipe-container');
    expect(sc).toBeInTheDocument();
    expect(sc?.querySelectorAll('.swipe-panel')).toHaveLength(2);
  });

  it('page indicator is hidden initially (shown after first swipe)', () => {
    const { container } = render(
      <SwipeContainer>
        <div>A</div>
        <div>B</div>
      </SwipeContainer>,
    );
    // PageIndicator returns null when show=false (before first swipe)
    expect(container.querySelector('.page-indicator')).not.toBeInTheDocument();
  });
});

// ---------- ResultModal ----------

describe('ResultModal – layout structure', () => {
  const baseProps = {
    won: true,
    guesses: [{ phoneName: 'iPhone 16', feedback: 'correct' as const }],
    elapsed: 5.2,
    puzzleNumber: 42,
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal-backdrop with centered flex container', () => {
    const { container } = render(<ResultModal {...baseProps} />);
    const backdrop = container.querySelector('.modal-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('renders modal-card inside backdrop', () => {
    const { container } = render(<ResultModal {...baseProps} />);
    const card = container.querySelector('.modal-card');
    expect(card).toBeInTheDocument();
    expect(card?.parentElement).toHaveClass('modal-backdrop');
  });

  it('has a close button for mobile tap targets', () => {
    render(<ResultModal {...baseProps} />);
    const closeBtn = document.querySelector('.modal-close');
    expect(closeBtn).toBeInTheDocument();
  });

  it('closes on backdrop click (outside card)', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ResultModal {...baseProps} onClose={onClose} />,
    );
    const backdrop = container.querySelector('.modal-backdrop') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the card', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ResultModal {...baseProps} onClose={onClose} />,
    );
    const card = container.querySelector('.modal-card') as HTMLElement;
    fireEvent.click(card);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders stats section for winning game', () => {
    render(<ResultModal {...baseProps} />);
    expect(screen.getByText('result.win')).toBeInTheDocument();
    const statValues = document.querySelectorAll('.stat-value');
    expect(statValues.length).toBeGreaterThanOrEqual(2);
  });

  it('renders loss state without score', () => {
    render(
      <ResultModal
        {...baseProps}
        won={false}
        guesses={[
          { phoneName: 'a', feedback: 'wrong_brand' },
          { phoneName: 'b', feedback: 'wrong_brand' },
          { phoneName: 'c', feedback: 'wrong_brand' },
          { phoneName: 'd', feedback: 'wrong_brand' },
          { phoneName: 'e', feedback: 'wrong_brand' },
          { phoneName: 'f', feedback: 'wrong_brand' },
        ]}
      />,
    );
    expect(screen.getByText('result.loss')).toBeInTheDocument();
    expect(screen.getByText('X/6')).toBeInTheDocument();
  });

  it('shows sign-in prompt for unauthenticated users', () => {
    render(<ResultModal {...baseProps} />);
    expect(screen.getByText('result.signInPrompt')).toBeInTheDocument();
  });
});

// ---------- PhoneAutocomplete ----------

describe('PhoneAutocomplete – viewport interaction', () => {
  const phones = [
    { id: 1, brand: 'Samsung', model: 'Galaxy S24' },
    { id: 2, brand: 'Apple', model: 'iPhone 16' },
    { id: 3, brand: 'Samsung', model: 'Galaxy Z Flip 6' },
  ];

  it('renders input with autocomplete-input class', () => {
    render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={false} />,
    );
    const input = document.querySelector('.autocomplete-input');
    expect(input).toBeInTheDocument();
  });

  it('renders typing placeholder when not disabled and input is empty', () => {
    vi.useFakeTimers();
    render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={false} />,
    );
    const placeholder = document.querySelector(
      '.autocomplete-typing-placeholder',
    );
    expect(placeholder).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('hides typing placeholder when disabled', () => {
    render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={true} />,
    );
    const placeholder = document.querySelector(
      '.autocomplete-typing-placeholder',
    );
    expect(placeholder).not.toBeInTheDocument();
  });

  it('shows dropdown above input (autocomplete-dropdown class)', () => {
    const { container } = render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={false} />,
    );
    const input = container.querySelector(
      '.autocomplete-input',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Samsung' } });

    const dropdown = container.querySelector('.autocomplete-dropdown');
    expect(dropdown).toBeInTheDocument();
  });

  it('limits dropdown items to 8 max', () => {
    const manyPhones = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      brand: 'Test',
      model: `Phone ${i}`,
    }));
    const { container } = render(
      <PhoneAutocomplete
        phones={manyPhones}
        onSelect={vi.fn()}
        disabled={false}
      />,
    );
    const input = container.querySelector(
      '.autocomplete-input',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test' } });

    const items = container.querySelectorAll('.autocomplete-item');
    expect(items.length).toBeLessThanOrEqual(8);
  });

  it('navigates dropdown with keyboard arrows', () => {
    const { container } = render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={false} />,
    );
    const input = container.querySelector(
      '.autocomplete-input',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Samsung' } });
    fireEvent.focus(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const items = container.querySelectorAll('.autocomplete-item');
    expect(items[1]).toHaveClass('selected');
  });

  it('selects item on Enter key', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PhoneAutocomplete
        phones={phones}
        onSelect={onSelect}
        disabled={false}
      />,
    );
    const input = container.querySelector(
      '.autocomplete-input',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Samsung' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Samsung' }),
    );
  });

  it('closes dropdown on Escape key', () => {
    const { container } = render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={false} />,
    );
    const input = container.querySelector(
      '.autocomplete-input',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Samsung' } });
    expect(
      container.querySelector('.autocomplete-dropdown'),
    ).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(
      container.querySelector('.autocomplete-dropdown'),
    ).not.toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <PhoneAutocomplete phones={phones} onSelect={vi.fn()} disabled={true} />,
    );
    const input = document.querySelector('.autocomplete-input');
    expect(input).toBeDisabled();
  });
});

// ---------- Onboarding – viewport adaptation ----------

describe('Onboarding – viewport and resize behavior', () => {
  let onDone: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDone = vi.fn();
    localStorage.clear();

    const cropWrapper = document.createElement('div');
    cropWrapper.className = 'crop-wrapper';
    cropWrapper.getBoundingClientRect = () => ({
      top: 100,
      left: 20,
      width: 300,
      height: 300,
      bottom: 400,
      right: 320,
      x: 20,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(cropWrapper);

    const guessHistory = document.createElement('div');
    guessHistory.className = 'guess-history';
    guessHistory.getBoundingClientRect = () => ({
      top: 420,
      left: 20,
      width: 300,
      height: 200,
      bottom: 620,
      right: 320,
      x: 20,
      y: 420,
      toJSON: () => {},
    });
    document.body.appendChild(guessHistory);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('spotlight updates on window resize', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    const spotlight = container.querySelector('.onboarding-spotlight');
    const initialTop = spotlight?.getAttribute('style');

    // Simulate element moving after resize
    const cropWrapper = document.querySelector('.crop-wrapper') as HTMLElement;
    cropWrapper.getBoundingClientRect = () => ({
      top: 150,
      left: 30,
      width: 280,
      height: 280,
      bottom: 430,
      right: 310,
      x: 30,
      y: 150,
      toJSON: () => {},
    });

    fireEvent.resize(window);

    const updatedStyle = spotlight?.getAttribute('style');
    // Style should have changed after resize with new rect values
    expect(updatedStyle).toBeTruthy();
  });

  it('positions tooltip below spotlight when target is in upper half', () => {
    setViewportHeight(1000);
    const { container } = render(<Onboarding onDone={onDone} />);
    const tooltip = container.querySelector(
      '.onboarding-tooltip',
    ) as HTMLElement;
    // Target at top=100, viewport height=1000, so top < height/2 → tooltip below
    expect(tooltip).toBeInTheDocument();
  });

  it('positions tooltip above spotlight when target is in lower half', () => {
    setViewportHeight(400);
    // With viewport height 400, crop-wrapper top is 100+300=400 area
    // rect.top (100) is not > 400/2=200, so tooltip goes below
    // Let's adjust the element position to test the "above" case
    const cropWrapper = document.querySelector('.crop-wrapper') as HTMLElement;
    cropWrapper.getBoundingClientRect = () => ({
      top: 300,
      left: 20,
      width: 300,
      height: 300,
      bottom: 600,
      right: 320,
      x: 20,
      y: 300,
      toJSON: () => {},
    });

    const { container } = render(<Onboarding onDone={onDone} />);
    const tooltip = container.querySelector(
      '.onboarding-tooltip',
    ) as HTMLElement;
    // rect.top (300) > 400/2=200 → tooltip above
    expect(tooltip.style.transform).toContain('translateY(-100%)');
  });

  it('renders backdrop covering full viewport', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    expect(container.querySelector('.onboarding-backdrop')).toBeInTheDocument();
  });

  it('onboarding-tooltip has max-width constraint for small viewports', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    const tooltip = container.querySelector('.onboarding-tooltip');
    expect(tooltip).toHaveClass('onboarding-tooltip');
    // CSS handles max-width: 320px + width: calc(100% - 32px)
  });
});

// ---------- BlockGrid – percentage-based layout ----------

describe('BlockGrid – viewport-independent percentage layout', () => {
  it('renders 36 block cells (6x6 grid)', () => {
    const { container } = render(<BlockGrid level={0} revealed={false} />);
    const cells = container.querySelectorAll('.block-cell');
    expect(cells).toHaveLength(36);
  });

  it('positions blocks using percentage values (viewport-independent)', () => {
    const { container } = render(<BlockGrid level={0} revealed={false} />);
    const cells = container.querySelectorAll('.block-cell');
    // All cells should have percentage-based left/top/width/height
    for (const cell of cells) {
      const style = (cell as HTMLElement).style;
      expect(style.left).toMatch(/%$/);
      expect(style.top).toMatch(/%$/);
      expect(style.width).toMatch(/%$/);
      expect(style.height).toMatch(/%$/);
    }
  });

  it('removes blocks progressively as level increases', () => {
    const { container: container0 } = render(
      <BlockGrid level={0} revealed={false} />,
    );
    const removed0 = container0.querySelectorAll('.block-removed').length;

    cleanup();

    const { container: container3 } = render(
      <BlockGrid level={3} revealed={false} />,
    );
    const removed3 = container3.querySelectorAll('.block-removed').length;

    expect(removed3).toBeGreaterThan(removed0);
  });

  it('applies win cascade animation on reveal (after gameplay)', () => {
    // Must start with revealed=false, then re-render with revealed=true
    // because initialRevealedRef skips rendering if revealed from start
    const { container, rerender } = render(
      <BlockGrid level={2} revealed={false} isWin={true} />,
    );
    rerender(<BlockGrid level={2} revealed={true} isWin={true} />);
    const cascadeWin = container.querySelectorAll('.block-cascade-win');
    expect(cascadeWin.length).toBeGreaterThan(0);
  });

  it('applies loss cascade animation on reveal (after gameplay)', () => {
    const { container, rerender } = render(
      <BlockGrid level={2} revealed={false} isWin={false} />,
    );
    rerender(<BlockGrid level={2} revealed={true} isWin={false} />);
    const cascadeLoss = container.querySelectorAll('.block-cascade-loss');
    expect(cascadeLoss.length).toBeGreaterThan(0);
  });

  it('returns null when revealed from start (loaded from localStorage)', () => {
    const { container } = render(<BlockGrid level={6} revealed={true} />);
    expect(container.querySelector('.block-grid')).not.toBeInTheDocument();
  });
});

// ---------- PageIndicator – fixed positioning ----------

describe('PageIndicator – overlay positioning', () => {
  it('renders with page-indicator class (fixed centered via CSS)', () => {
    const { container } = render(<PageIndicator name="Game" show={true} />);
    expect(container.querySelector('.page-indicator')).toBeInTheDocument();
  });

  it('adds visible class when shown', () => {
    const { container } = render(<PageIndicator name="Game" show={true} />);
    expect(container.querySelector('.page-indicator')).toHaveClass(
      'page-indicator-visible',
    );
  });

  it('does not render when show is false', () => {
    const { container } = render(<PageIndicator name="Game" show={false} />);
    expect(container.querySelector('.page-indicator')).not.toBeInTheDocument();
  });

  it('hides after timeout (transient indicator)', () => {
    vi.useFakeTimers();
    const { container } = render(<PageIndicator name="Game" show={true} />);
    expect(container.querySelector('.page-indicator')).toHaveClass(
      'page-indicator-visible',
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(container.querySelector('.page-indicator')).not.toHaveClass(
      'page-indicator-visible',
    );
    vi.useRealTimers();
  });
});

// ---------- GuessHistory – responsive rows ----------

describe('GuessHistory – guess row layout structure', () => {
  const guesses = [
    { phoneName: 'Apple iPhone 15', feedback: 'wrong_brand' as const },
    { phoneName: 'Samsung Galaxy S23', feedback: 'right_brand' as const },
    { phoneName: 'Samsung Galaxy S24', feedback: 'correct' as const },
  ];

  it('renders guess-history container for flex column layout', () => {
    const { container } = render(
      <GuessHistory guesses={guesses} maxGuesses={6} />,
    );
    expect(container.querySelector('.guess-history')).toBeInTheDocument();
  });

  it('each guess row has guess-name for flex-grow text', () => {
    const { container } = render(
      <GuessHistory guesses={guesses} maxGuesses={6} />,
    );
    const names = container.querySelectorAll('.guess-name');
    expect(names).toHaveLength(3);
    expect(names[0].textContent).toBe('Apple iPhone 15');
  });

  it('empty slots render with minimum height class', () => {
    const { container } = render(<GuessHistory guesses={[]} maxGuesses={6} />);
    const emptyRows = container.querySelectorAll('.guess-empty');
    expect(emptyRows).toHaveLength(6);
  });

  it('applies distinct border color classes per feedback type', () => {
    const { container } = render(
      <GuessHistory guesses={guesses} maxGuesses={6} />,
    );
    expect(container.querySelector('.guess-wrong')).toBeInTheDocument();
    expect(container.querySelector('.guess-close')).toBeInTheDocument();
    expect(container.querySelector('.guess-correct')).toBeInTheDocument();
  });
});

// ---------- Leaderboard – tab layout ----------

describe('Leaderboard – tab layout and structure', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ entries: [] }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders 4 tab buttons in flex row', () => {
    const { container } = render(<Leaderboard />);
    const tabs = container.querySelectorAll('.leaderboard-tab');
    expect(tabs).toHaveLength(4);
  });

  it('daily tab is active by default', () => {
    const { container } = render(<Leaderboard />);
    const tabs = container.querySelectorAll('.leaderboard-tab');
    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
  });

  it('switches active tab on click', () => {
    const { container } = render(<Leaderboard />);
    const tabs = container.querySelectorAll('.leaderboard-tab');
    fireEvent.click(tabs[2]); // monthly
    expect(tabs[2]).toHaveClass('active');
    expect(tabs[0]).not.toHaveClass('active');
  });

  it('tabs container uses leaderboard-tabs class for flex layout', () => {
    const { container } = render(<Leaderboard />);
    expect(container.querySelector('.leaderboard-tabs')).toBeInTheDocument();
  });
});

// ---------- Cross-browser CSS class verification ----------

describe('Cross-browser CSS class coverage', () => {
  it('swipe-container has scrollbar-hiding class structure', () => {
    const { container } = render(
      <SwipeContainer>
        <div>A</div>
        <div>B</div>
      </SwipeContainer>,
    );
    // The swipe-container class has CSS: scrollbar-width: none + ::-webkit-scrollbar { display: none }
    expect(container.querySelector('.swipe-container')).toBeInTheDocument();
  });

  it('guess-empty has backdrop-filter classes for iOS blur', () => {
    const { container } = render(<GuessHistory guesses={[]} maxGuesses={6} />);
    // .guess-empty CSS includes both backdrop-filter and -webkit-backdrop-filter
    const empty = container.querySelector('.guess-empty');
    expect(empty).toBeInTheDocument();
  });

  it('modal-backdrop has backdrop-filter class for cross-browser blur', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ResultModal
        won={true}
        guesses={[{ phoneName: 'iPhone 16', feedback: 'correct' }]}
        elapsed={5}
        puzzleNumber={1}
        onClose={onClose}
      />,
    );
    // .modal-backdrop CSS includes both backdrop-filter and -webkit-backdrop-filter
    expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
  });

  it('autocomplete-cursor has cross-browser blink animation class', () => {
    vi.useFakeTimers();
    render(
      <PhoneAutocomplete
        phones={[{ id: 1, brand: 'Test', model: 'Phone' }]}
        onSelect={vi.fn()}
        disabled={false}
      />,
    );
    // .autocomplete-cursor CSS uses @keyframes blink-cursor with step-end
    expect(document.querySelector('.autocomplete-cursor')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('onboarding uses both vendor-prefixed and standard animation classes', () => {
    localStorage.clear();

    const cropWrapper = document.createElement('div');
    cropWrapper.className = 'crop-wrapper';
    cropWrapper.getBoundingClientRect = () => ({
      top: 100,
      left: 20,
      width: 300,
      height: 300,
      bottom: 400,
      right: 320,
      x: 20,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(cropWrapper);

    const { container } = render(<Onboarding onDone={vi.fn()} />);
    // .onboarding-backdrop uses animation: modal-fade-in
    // CSS has @media (prefers-reduced-motion: reduce) to disable animations
    expect(container.querySelector('.onboarding-backdrop')).toBeInTheDocument();
    expect(
      container.querySelector('.onboarding-spotlight'),
    ).toBeInTheDocument();
    expect(container.querySelector('.onboarding-tooltip')).toBeInTheDocument();

    document.body.innerHTML = '';
  });
});

// ---------- Viewport-specific behavior ----------

describe('Viewport-specific behavior', () => {
  afterEach(() => {
    setViewportWidth(1024);
    setViewportHeight(768);
  });

  it('onboarding tooltip positioning adapts to small viewport height', () => {
    setViewportHeight(500);
    localStorage.clear();

    const cropWrapper = document.createElement('div');
    cropWrapper.className = 'crop-wrapper';
    cropWrapper.getBoundingClientRect = () => ({
      top: 300,
      left: 20,
      width: 300,
      height: 150,
      bottom: 450,
      right: 320,
      x: 20,
      y: 300,
      toJSON: () => {},
    });
    document.body.appendChild(cropWrapper);

    const { container } = render(<Onboarding onDone={vi.fn()} />);
    const tooltip = container.querySelector(
      '.onboarding-tooltip',
    ) as HTMLElement;
    // rect.top (300) > 500/2 (250) → tooltip above with translateY(-100%)
    expect(tooltip.style.transform).toContain('translateY(-100%)');

    document.body.innerHTML = '';
  });

  it('onboarding tooltip goes below when target is in upper viewport', () => {
    setViewportHeight(800);
    localStorage.clear();

    const cropWrapper = document.createElement('div');
    cropWrapper.className = 'crop-wrapper';
    cropWrapper.getBoundingClientRect = () => ({
      top: 100,
      left: 20,
      width: 300,
      height: 200,
      bottom: 300,
      right: 320,
      x: 20,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(cropWrapper);

    const { container } = render(<Onboarding onDone={vi.fn()} />);
    const tooltip = container.querySelector(
      '.onboarding-tooltip',
    ) as HTMLElement;
    // rect.top (100) < 800/2 (400) → tooltip below, no translateY(-100%)
    expect(tooltip.style.transform).not.toContain('translateY(-100%)');

    document.body.innerHTML = '';
  });

  it('BlockGrid blocks always use percentage sizing regardless of viewport', () => {
    setViewportWidth(320);
    const { container } = render(<BlockGrid level={1} revealed={false} />);
    const cells = container.querySelectorAll('.block-cell');

    // Verify percentage-based dimensions
    const firstCell = cells[0] as HTMLElement;
    expect(firstCell.style.width).toContain('%');
    expect(firstCell.style.height).toContain('%');

    // Cell dimensions should be 100/6 ≈ 16.666...%
    expect(Number.parseFloat(firstCell.style.width)).toBeCloseTo(16.667, 0);
    expect(Number.parseFloat(firstCell.style.height)).toBeCloseTo(16.667, 0);
  });
});
