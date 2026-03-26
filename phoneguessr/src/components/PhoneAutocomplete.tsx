import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface Phone {
  id: number;
  brand: string;
  model: string;
}

interface PhoneAutocompleteProps {
  phones: Phone[];
  onSelect: (phone: Phone) => void;
  disabled: boolean;
}

const SAMPLE_PHONES = [
  'iPhone 16 Pro',
  'Samsung Galaxy S25',
  'Google Pixel 9',
  'OnePlus 13',
  'Sony Xperia 1 VI',
];

function useTypingPlaceholder(active: boolean) {
  const [text, setText] = useState('');
  const stateRef = useRef({ wordIdx: 0, charIdx: 0, deleting: false });

  useEffect(() => {
    if (!active) {
      setText('');
      stateRef.current = { wordIdx: 0, charIdx: 0, deleting: false };
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const word = SAMPLE_PHONES[s.wordIdx];
      if (s.deleting) {
        s.charIdx--;
        setText(word.slice(0, s.charIdx));
        if (s.charIdx === 0) {
          s.deleting = false;
          s.wordIdx = (s.wordIdx + 1) % SAMPLE_PHONES.length;
        }
        timer = setTimeout(tick, 40);
      } else {
        s.charIdx++;
        setText(word.slice(0, s.charIdx));
        if (s.charIdx === word.length) {
          s.deleting = true;
          timer = setTimeout(tick, 1500);
        } else {
          timer = setTimeout(tick, 80);
        }
      }
    };
    timer = setTimeout(tick, 80);
    return () => clearTimeout(timer);
  }, [active]);

  return text;
}

export function PhoneAutocomplete({
  phones,
  onSelect,
  disabled,
}: PhoneAutocompleteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [fixedBottom, setFixedBottom] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Evaluated once per mount; pointer type doesn't change mid-session
  const isTouchRef = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches,
  );
  const isTouch = isTouchRef.current;
  const typingText = useTypingPlaceholder(!disabled && query.length === 0);

  // Pin the input just above the virtual keyboard using the Visual Viewport API
  useEffect(() => {
    if (!isFocused || !isTouch) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setFixedBottom(
        Math.max(0, window.innerHeight - vv.offsetTop - vv.height),
      );
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      setFixedBottom(0);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isFocused]);

  const filtered =
    query.length >= 2
      ? phones.filter(p => {
          const full = `${p.brand} ${p.model}`.toLowerCase();
          return full.includes(query.toLowerCase());
        })
      : [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: query is a trigger to reset selection, not read inside the effect
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (phone: Phone) => {
    onSelect(phone);
    setQuery('');
    setShowDropdown(false);
    // Dismiss virtual keyboard on mobile after selection
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const pinned = isFocused && isTouch;

  const inputEl = (
    <div
      className={`autocomplete${pinned ? ' autocomplete--pinned' : ''}`}
      style={
        pinned
          ? { position: 'fixed', bottom: fixedBottom, left: 0, right: 0 }
          : undefined
      }
    >
      <div className="autocomplete-wrapper">
        {query.length === 0 && !disabled && (
          <span className="autocomplete-typing-placeholder">
            {typingText}
            <span className="autocomplete-cursor" />
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-input"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setShowDropdown(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowDropdown(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? t('input.placeholder') : ''}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="search"
          enterKeyHint="search"
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filtered.slice(0, 8).map((phone, i) => (
            <li
              key={phone.id}
              className={`autocomplete-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(phone)}
            >
              <span className="autocomplete-brand">{phone.brand}</span>{' '}
              {phone.model}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {/* Holds space in the document flow while the input is fixed */}
      {pinned && <div className="autocomplete-placeholder" aria-hidden />}
      {/*
       * Portal to document.body when pinned so that position:fixed is relative
       * to the viewport, not the .swipe-panel ancestor which has contain:paint
       * (CSS Containment creates a new containing block for fixed descendants).
       */}
      {pinned ? createPortal(inputEl, document.body) : inputEl}
    </>
  );
}
