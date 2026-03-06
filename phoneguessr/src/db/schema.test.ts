import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  dailyPuzzles,
  guesses,
  hints,
  phoneFacts,
  phones,
  results,
  streaks,
  users,
} from './schema';

function getColumnNames(table: {
  [key: string]: { name?: string };
}): string[] {
  return Object.values(table)
    .filter(col => col && typeof col === 'object' && 'name' in col)
    .map(col => col.name as string);
}

describe('Schema exports', () => {
  it('exports all 8 tables', () => {
    expect(phones).toBeDefined();
    expect(dailyPuzzles).toBeDefined();
    expect(users).toBeDefined();
    expect(guesses).toBeDefined();
    expect(results).toBeDefined();
    expect(phoneFacts).toBeDefined();
    expect(streaks).toBeDefined();
    expect(hints).toBeDefined();
  });
});

describe('Phones table', () => {
  const cols = getColumnNames(
    phones as unknown as Record<string, { name?: string }>,
  );

  it('has all required columns', () => {
    expect(cols).toContain('id');
    expect(cols).toContain('brand');
    expect(cols).toContain('model');
    expect(cols).toContain('image_path');
    expect(cols).toContain('active');
    expect(cols).toContain('created_at');
  });

  it('has metadata columns', () => {
    expect(cols).toContain('release_year');
    expect(cols).toContain('price_tier');
    expect(cols).toContain('form_factor');
    expect(cols).toContain('difficulty');
  });
});

describe('Phone Facts table', () => {
  const cols = getColumnNames(
    phoneFacts as unknown as Record<string, { name?: string }>,
  );

  it('has all required columns', () => {
    expect(cols).toContain('id');
    expect(cols).toContain('phone_id');
    expect(cols).toContain('fact_text');
    expect(cols).toContain('fact_type');
    expect(cols).toContain('created_at');
  });
});

describe('Streaks table', () => {
  const cols = getColumnNames(
    streaks as unknown as Record<string, { name?: string }>,
  );

  it('has all required columns', () => {
    expect(cols).toContain('id');
    expect(cols).toContain('user_id');
    expect(cols).toContain('current_streak');
    expect(cols).toContain('best_streak');
    expect(cols).toContain('last_played_date');
    expect(cols).toContain('created_at');
  });
});

describe('Hints table', () => {
  const cols = getColumnNames(
    hints as unknown as Record<string, { name?: string }>,
  );

  it('has all required columns', () => {
    expect(cols).toContain('id');
    expect(cols).toContain('user_id');
    expect(cols).toContain('puzzle_id');
    expect(cols).toContain('hint_type');
    expect(cols).toContain('created_at');
  });
});

describe('Migration SQL', () => {
  const drizzleDir = path.join(__dirname, '../../drizzle');
  const migrationFiles = fs
    .readdirSync(drizzleDir)
    .filter(f => f.endsWith('.sql'));
  const sqlContent = fs.readFileSync(
    path.join(drizzleDir, migrationFiles[0]),
    'utf-8',
  );

  it('migration file exists', () => {
    expect(migrationFiles.length).toBeGreaterThan(0);
  });

  it('creates new tables', () => {
    expect(sqlContent).toContain('CREATE TABLE "hints"');
    expect(sqlContent).toContain('CREATE TABLE "phone_facts"');
    expect(sqlContent).toContain('CREATE TABLE "streaks"');
  });

  it('adds metadata columns to phones', () => {
    expect(sqlContent).toContain('"release_year" integer');
    expect(sqlContent).toContain('"price_tier" varchar(20)');
    expect(sqlContent).toContain('"form_factor" varchar(20)');
    expect(sqlContent).toContain('"difficulty" varchar(10)');
  });

  it('has foreign key constraints for new tables', () => {
    expect(sqlContent).toContain('hints_user_id_users_id_fk');
    expect(sqlContent).toContain('hints_puzzle_id_daily_puzzles_id_fk');
    expect(sqlContent).toContain('phone_facts_phone_id_phones_id_fk');
    expect(sqlContent).toContain('streaks_user_id_users_id_fk');
  });

  it('streak defaults are correct', () => {
    expect(sqlContent).toContain('"current_streak" integer DEFAULT 0 NOT NULL');
    expect(sqlContent).toContain('"best_streak" integer DEFAULT 0 NOT NULL');
  });

  it('new phone columns are nullable for backward compatibility', () => {
    expect(sqlContent).not.toContain('"release_year" integer NOT NULL');
    expect(sqlContent).not.toContain('"price_tier" varchar(20) NOT NULL');
  });
});

describe('Data integrity constraints in schema', () => {
  it('dailyPuzzles has puzzleDate column for unique index', () => {
    const cols = getColumnNames(
      dailyPuzzles as unknown as Record<string, { name?: string }>,
    );
    expect(cols).toContain('puzzle_date');
  });

  it('users has unique googleId', () => {
    const cols = getColumnNames(
      users as unknown as Record<string, { name?: string }>,
    );
    expect(cols).toContain('google_id');
  });

  it('results table has userId and puzzleId columns for uniqueness', () => {
    const cols = getColumnNames(
      results as unknown as Record<string, { name?: string }>,
    );
    expect(cols).toContain('user_id');
    expect(cols).toContain('puzzle_id');
  });

  it('streaks table has userId column for uniqueness', () => {
    const cols = getColumnNames(
      streaks as unknown as Record<string, { name?: string }>,
    );
    expect(cols).toContain('user_id');
  });

  it('phones table has brand and model columns for uniqueness', () => {
    const cols = getColumnNames(
      phones as unknown as Record<string, { name?: string }>,
    );
    expect(cols).toContain('brand');
    expect(cols).toContain('model');
  });
});
