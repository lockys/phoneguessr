import { useState, useRef, useEffect } from 'react';
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
        placeholder={t('input.placeholder')}
        disabled={disabled}
        autoComplete="off"
      />
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
