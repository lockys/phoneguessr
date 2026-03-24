import { describe, it, expect } from 'vitest';
import { isLicenseAccepted } from './fetch-wikimedia-images';

describe('isLicenseAccepted', () => {
  it('accepts CC0', () => expect(isLicenseAccepted('CC0')).toBe(true));
  it('accepts Public domain', () => expect(isLicenseAccepted('Public domain')).toBe(true));
  it('accepts CC BY 4.0', () => expect(isLicenseAccepted('CC BY 4.0')).toBe(true));
  it('accepts CC BY 2.0', () => expect(isLicenseAccepted('CC BY 2.0')).toBe(true));
  it('accepts CC BY-SA 4.0', () => expect(isLicenseAccepted('CC BY-SA 4.0')).toBe(true));
  it('accepts CC BY-SA 3.0', () => expect(isLicenseAccepted('CC BY-SA 3.0')).toBe(true));
  it('accepts dual license with CC component', () => expect(isLicenseAccepted('CC BY-SA 3.0 or GFDL')).toBe(true));
  it('rejects GFDL alone', () => expect(isLicenseAccepted('GFDL')).toBe(false));
  it('rejects CC BY-NC 4.0', () => expect(isLicenseAccepted('CC BY-NC 4.0')).toBe(false));
  it('rejects CC BY-ND 4.0', () => expect(isLicenseAccepted('CC BY-ND 4.0')).toBe(false));
  it('rejects All rights reserved', () => expect(isLicenseAccepted('All rights reserved')).toBe(false));
  it('rejects empty string', () => expect(isLicenseAccepted('')).toBe(false));
  it('rejects undefined', () => expect(isLicenseAccepted(undefined)).toBe(false));
});

import { selectBestImage, type WikiImageCandidate } from './fetch-wikimedia-images';

describe('selectBestImage', () => {
  const base: WikiImageCandidate = {
    title: 'File:Samsung Galaxy S24.jpg',
    url: 'https://upload.wikimedia.org/samsung-s24.jpg',
    width: 400,
    height: 800,
    license: 'CC BY-SA 4.0',
    attribution: 'Samsung',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };

  it('returns null for empty list', () => {
    expect(selectBestImage([])).toBeNull();
  });

  it('rejects landscape images (width > height)', () => {
    const landscape = { ...base, width: 900, height: 400 };
    expect(selectBestImage([landscape])).toBeNull();
  });

  it('rejects blocklisted filenames', () => {
    const hand = { ...base, title: 'File:Samsung holding hand.jpg' };
    expect(selectBestImage([hand])).toBeNull();
  });

  it('rejects SVG format', () => {
    const svg = { ...base, title: 'File:Samsung Galaxy S24.svg' };
    expect(selectBestImage([svg])).toBeNull();
  });

  it('selects a valid portrait image', () => {
    expect(selectBestImage([base])).toEqual(base);
  });

  it('prefers image with model name in filename over generic name (same resolution)', () => {
    // Both same resolution — model name score must be the tiebreaker, not insertion order
    const generic = { ...base, title: 'File:Phone.jpg', url: 'https://upload.wikimedia.org/generic.jpg' };
    const named = { ...base, title: 'File:Samsung Galaxy S24.jpg', url: 'https://upload.wikimedia.org/named.jpg' };
    // Test both orderings to prove score, not array position, determines winner
    expect(selectBestImage([generic, named], 'Galaxy S24')?.url).toBe(named.url);
    expect(selectBestImage([named, generic], 'Galaxy S24')?.url).toBe(named.url);
  });

  it('prefers higher resolution among equal candidates', () => {
    const small = { ...base, url: 'https://upload.wikimedia.org/small.jpg', width: 200, height: 400 };
    const large = { ...base, url: 'https://upload.wikimedia.org/large.jpg', width: 400, height: 800 };
    expect(selectBestImage([small, large])?.url).toBe(large.url);
  });
});
