import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Onboarding, isOnboarded } from './Onboarding';

describe('Onboarding', () => {
  let onDone: () => void;

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

  it('renders step 1 title on initial render', () => {
    render(<Onboarding onDone={onDone} />);
    expect(screen.getByText('onboarding.step1.title')).toBeInTheDocument();
    expect(screen.getByText('onboarding.step1.desc')).toBeInTheDocument();
  });

  it('shows skip and next buttons', () => {
    render(<Onboarding onDone={onDone} />);
    expect(screen.getByText('onboarding.skip')).toBeInTheDocument();
    expect(screen.getByText('onboarding.next')).toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    expect(screen.getByText('onboarding.step2.title')).toBeInTheDocument();
  });

  it('advances to step 3 when Next is clicked twice', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    fireEvent.click(screen.getByText('onboarding.next'));
    expect(screen.getByText('onboarding.step3.title')).toBeInTheDocument();
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

  it('renders progress bars', () => {
    render(<Onboarding onDone={onDone} />);
    // Portal renders into document.body, not the render container
    const bars = document.querySelectorAll('.onboarding-progress-bar');
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveClass('onboarding-progress-active');
    expect(bars[1]).not.toHaveClass('onboarding-progress-active');
  });

  it('fills progress bars as steps advance', () => {
    render(<Onboarding onDone={onDone} />);
    fireEvent.click(screen.getByText('onboarding.next'));
    const bars = document.querySelectorAll('.onboarding-progress-bar');
    expect(bars[0]).toHaveClass('onboarding-progress-active');
    expect(bars[1]).toHaveClass('onboarding-progress-active');
    expect(bars[2]).not.toHaveClass('onboarding-progress-active');
  });

  it('renders a spotlight element', () => {
    render(<Onboarding onDone={onDone} />);
    expect(document.querySelector('.onboarding-spotlight')).toBeInTheDocument();
  });

  it('renders bottom card layout', () => {
    render(<Onboarding onDone={onDone} />);
    expect(document.querySelector('.onboarding-card')).toBeInTheDocument();
    expect(
      document.querySelector('.onboarding-step-indicator'),
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
