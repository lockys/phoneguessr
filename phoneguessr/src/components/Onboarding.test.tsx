import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Onboarding, isOnboarded } from './Onboarding';

describe('Onboarding', () => {
  let onDone: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDone = vi.fn();
    localStorage.clear();

    // Create mock target elements for spotlight
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

  it('renders step 1 text on initial render', () => {
    render(<Onboarding onDone={onDone} />);
    expect(screen.getByText('onboarding.step1')).toBeInTheDocument();
  });

  it('shows skip and next buttons', () => {
    render(<Onboarding onDone={onDone} />);
    expect(screen.getByText('onboarding.skip')).toBeInTheDocument();
    expect(screen.getByText('onboarding.next')).toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    expect(screen.getByText('onboarding.step2')).toBeInTheDocument();
  });

  it('advances to step 3 when Next is clicked twice', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    fireEvent.click(screen.getByText('onboarding.next'));
    expect(screen.getByText('onboarding.step3')).toBeInTheDocument();
  });

  it('shows Done button on last step', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    fireEvent.click(screen.getByText('onboarding.next'));
    expect(screen.getByText('onboarding.done')).toBeInTheDocument();
  });

  it('calls onDone and sets localStorage when Done is clicked', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    fireEvent.click(screen.getByText('onboarding.next'));
    fireEvent.click(screen.getByText('onboarding.done'));
    expect(onDone).toHaveBeenCalledOnce();
    expect(localStorage.getItem('phoneguessr_onboarded')).toBe('1');
  });

  it('calls onDone and sets localStorage when Skip is clicked', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.skip'));
    expect(onDone).toHaveBeenCalledOnce();
    expect(localStorage.getItem('phoneguessr_onboarded')).toBe('1');
  });

  it('renders step indicator dots', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    const dots = container.querySelectorAll('.onboarding-dot');
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveClass('onboarding-dot-active');
    expect(dots[1]).not.toHaveClass('onboarding-dot-active');
  });

  it('updates active dot when step changes', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    const dots = container.querySelectorAll('.onboarding-dot');
    expect(dots[0]).not.toHaveClass('onboarding-dot-active');
    expect(dots[1]).toHaveClass('onboarding-dot-active');
  });

  it('renders a spotlight element', () => {
    const { container } = render(<Onboarding onDone={onDone} />);
    expect(
      container.querySelector('.onboarding-spotlight'),
    ).toBeInTheDocument();
  });
});

describe('isOnboarded', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when not onboarded', () => {
    expect(isOnboarded()).toBe(false);
  });

  it('returns true when onboarded', () => {
    localStorage.setItem('phoneguessr_onboarded', '1');
    expect(isOnboarded()).toBe(true);
  });
});
