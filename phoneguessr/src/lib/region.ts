import { countries } from 'countries-list';

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return [...upper]
    .map(c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}

export const COUNTRY_LIST: { code: string; name: string }[] = (
  Object.entries(countries) as [string, { name: string }][]
)
  .map(([code, country]) => ({ code, name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_CODES: string[] = COUNTRY_LIST.map(c => c.code);
