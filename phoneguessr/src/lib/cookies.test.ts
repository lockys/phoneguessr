// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseCookies, serializeCookie } from './cookies';

describe('parseCookies', () => {
  it('returns empty object for null header', () => {
    expect(parseCookies(null)).toEqual({});
  });

  it('returns empty object for empty string', () => {
    expect(parseCookies('')).toEqual({});
  });

  it('parses a single cookie', () => {
    expect(parseCookies('session=abc123')).toEqual({ session: 'abc123' });
  });

  it('parses multiple cookies', () => {
    expect(parseCookies('a=1; b=2; c=3')).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('decodes percent-encoded cookie values', () => {
    const encoded = 'token=' + encodeURIComponent('hello world');
    expect(parseCookies(encoded)).toEqual({ token: 'hello world' });
  });

  it('decodes special characters in values', () => {
    const encoded = 'data=' + encodeURIComponent('a=1&b=2');
    expect(parseCookies(encoded)).toEqual({ 'data': 'a=1&b=2' });
  });

  it('handles cookies with no value (no = sign)', () => {
    expect(parseCookies('invalid')).toEqual({});
  });

  it('trims whitespace around cookie names and values', () => {
    expect(parseCookies('  key  =  val  ')).toEqual({ key: 'val' });
  });

  it('uses the value after the first = for values containing =', () => {
    const result = parseCookies('token=abc=def');
    expect(result['token']).toBe('abc=def');
  });
});

describe('serializeCookie', () => {
  it('serializes a basic name=value cookie', () => {
    const result = serializeCookie('session', 'abc123');
    expect(result).toBe('session=abc123');
  });

  it('percent-encodes the cookie value', () => {
    const result = serializeCookie('data', 'hello world');
    expect(result).toBe('data=hello%20world');
  });

  it('adds HttpOnly flag', () => {
    const result = serializeCookie('s', 'v', { httpOnly: true });
    expect(result).toContain('; HttpOnly');
  });

  it('adds Secure flag', () => {
    const result = serializeCookie('s', 'v', { secure: true });
    expect(result).toContain('; Secure');
  });

  it('adds SameSite flag', () => {
    const result = serializeCookie('s', 'v', { sameSite: 'Strict' });
    expect(result).toContain('; SameSite=Strict');
  });

  it('adds SameSite=Lax', () => {
    const result = serializeCookie('s', 'v', { sameSite: 'Lax' });
    expect(result).toContain('; SameSite=Lax');
  });

  it('adds SameSite=None', () => {
    const result = serializeCookie('s', 'v', { sameSite: 'None' });
    expect(result).toContain('; SameSite=None');
  });

  it('adds Path flag', () => {
    const result = serializeCookie('s', 'v', { path: '/' });
    expect(result).toContain('; Path=/');
  });

  it('adds Max-Age flag', () => {
    const result = serializeCookie('s', 'v', { maxAge: 3600 });
    expect(result).toContain('; Max-Age=3600');
  });

  it('adds Max-Age=0 for immediate expiry', () => {
    const result = serializeCookie('s', 'v', { maxAge: 0 });
    expect(result).toContain('; Max-Age=0');
  });

  it('omits flags that are not set', () => {
    const result = serializeCookie('s', 'v', {});
    expect(result).toBe('s=v');
  });

  it('combines all options', () => {
    const result = serializeCookie('session', 'tok', {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 86400,
    });
    expect(result).toBe('session=tok; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400');
  });
});
