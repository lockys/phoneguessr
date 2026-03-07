import { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const typingText = useTypingPlaceholder(!disabled && query.length === 0);

  const filtered =
    query.length >= 2
      ? phones.filter(p => {
          const full = `${p.brand} ${p.model}`.toLowerCase();
          return full.includes(query.toLowerCase());
        })
      : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (phone: Phone) => {
    onSelect(phone);
    setQuery('');
    setShowDropdown(false);
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

  return (
    <div className="autocomplete">
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
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? t('input.placeholder') : ''}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filtered.slice(0, 8).map((phone, i) => (
            <li
              key={phone.id}
              className={`autocomplete-item ${i === selectedIndex ? 'selected' : ''}`}
              onPointerDown={() => handleSelect(phone)}
            >
              <span className="autocomplete-brand">{phone.brand}</span>{' '}
              {phone.model}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
