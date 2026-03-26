import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../lib/auth-context', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

import { DesktopNav } from './DesktopNav';

afterEach(cleanup);

describe('DesktopNav', () => {
  it('renders 4 tab buttons', () => {
    render(<DesktopNav activeIndex={1} onNavigate={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('marks the active tab with active class', () => {
    render(<DesktopNav activeIndex={2} onNavigate={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveClass('active');
    expect(buttons[0]).not.toHaveClass('active');
  });

  it('calls onNavigate with correct index on click', () => {
    const onNavigate = vi.fn();
    render(<DesktopNav activeIndex={0} onNavigate={onNavigate} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // Leaderboard = index 2
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('does not render Admin link when user is not admin', () => {
    render(<DesktopNav activeIndex={0} onNavigate={vi.fn()} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
