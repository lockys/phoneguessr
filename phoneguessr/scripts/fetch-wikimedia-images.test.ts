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
