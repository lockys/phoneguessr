import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateDisplayName } from '../src/lib/validation.ts';

describe('validateDisplayName', () => {
  it('accepts a valid display name', () => {
    const result = validateDisplayName('Calvin');
    assert.deepStrictEqual(result, { valid: true, value: 'Calvin' });
  });

  it('trims whitespace', () => {
    const result = validateDisplayName('  Calvin  ');
    assert.deepStrictEqual(result, { valid: true, value: 'Calvin' });
  });

  it('accepts unicode characters', () => {
    const result = validateDisplayName('卡爾文');
    assert.deepStrictEqual(result, { valid: true, value: '卡爾文' });
  });

  it('accepts exactly 1 character', () => {
    const result = validateDisplayName('A');
    assert.deepStrictEqual(result, { valid: true, value: 'A' });
  });

  it('accepts exactly 50 characters', () => {
    const name = 'A'.repeat(50);
    const result = validateDisplayName(name);
    assert.deepStrictEqual(result, { valid: true, value: name });
  });

  it('rejects empty string', () => {
    const result = validateDisplayName('');
    assert.equal(result.valid, false);
  });

  it('rejects whitespace-only string', () => {
    const result = validateDisplayName('   ');
    assert.equal(result.valid, false);
  });

  it('rejects string longer than 50 chars', () => {
    const result = validateDisplayName('A'.repeat(51));
    assert.equal(result.valid, false);
  });

  it('rejects string with < character', () => {
    const result = validateDisplayName('<script>alert(1)</script>');
    assert.equal(result.valid, false);
  });

  it('rejects string with > character', () => {
    const result = validateDisplayName('name>');
    assert.equal(result.valid, false);
  });

  it('rejects non-string input (number)', () => {
    const result = validateDisplayName(123 as unknown);
    assert.equal(result.valid, false);
  });

  it('rejects non-string input (null)', () => {
    const result = validateDisplayName(null as unknown);
    assert.equal(result.valid, false);
  });

  it('rejects non-string input (undefined)', () => {
    const result = validateDisplayName(undefined as unknown);
    assert.equal(result.valid, false);
  });
});
