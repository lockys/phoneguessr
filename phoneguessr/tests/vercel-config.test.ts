// @vitest-environment node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

const vercelConfigPath = path.resolve(__dirname, '../../vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
const rewrites: Array<{ source: string; destination: string }> =
  vercelConfig.rewrites;

describe('vercel.json rewrites', () => {
  it('has rewrites array', () => {
    expect(Array.isArray(rewrites)).toBe(true);
    expect(rewrites.length).toBeGreaterThan(0);
  });

  it('SPA catch-all is the last rewrite', () => {
    const last = rewrites[rewrites.length - 1];
    expect(last.source).toBe('/(.*)');
    expect(last.destination).toBe('/index.html');
  });

  it('all API rewrites come before SPA catch-all', () => {
    const catchAllIndex = rewrites.findIndex(r => r.source === '/(.*)');
    const apiRewrites = rewrites.filter(r => r.source.startsWith('/api/'));
    for (const apiRewrite of apiRewrites) {
      const idx = rewrites.indexOf(apiRewrite);
      expect(idx).toBeLessThan(catchAllIndex);
    }
  });

  it.each([
    ['/api/puzzle/:action', '/api/puzzle?action=:action'],
    ['/api/leaderboard/:period', '/api/leaderboard?period=:period'],
    ['/api/auth/passkey/:action', '/api/auth/passkey?action=:action'],
    ['/api/profile/:path*', '/api/profile'],
  ])('has rewrite %s → %s', (source, destination) => {
    const match = rewrites.find(r => r.source === source);
    expect(match).toBeDefined();
    expect(match!.destination).toBe(destination);
  });

  it('API function count stays within Vercel Hobby limit', () => {
    const apiDir = path.resolve(__dirname, '../../api');
    const countTsFiles = (dir: string): number => {
      let count = 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          count += countTsFiles(path.join(dir, entry.name));
        } else if (
          entry.name.endsWith('.ts') &&
          entry.name !== 'tsconfig.json'
        ) {
          count++;
        }
      }
      return count;
    };
    const functionCount = countTsFiles(apiDir);
    expect(functionCount).toBeLessThanOrEqual(13);
  });
});
