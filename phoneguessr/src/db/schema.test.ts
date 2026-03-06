/**
 * Schema validation tests for database migration.
 * Run with: npx tsx src/db/schema.test.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
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

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function getColumnNames(table: { [key: string]: { name?: string } }): string[] {
  return Object.values(table)
    .filter(col => col && typeof col === 'object' && 'name' in col)
    .map(col => col.name as string);
}

// --- Schema Export Tests ---
console.log('\n=== Schema Exports ===');
assert(typeof phones !== 'undefined', 'phones table exported');
assert(typeof dailyPuzzles !== 'undefined', 'dailyPuzzles table exported');
assert(typeof users !== 'undefined', 'users table exported');
assert(typeof guesses !== 'undefined', 'guesses table exported');
assert(typeof results !== 'undefined', 'results table exported');
assert(typeof phoneFacts !== 'undefined', 'phoneFacts table exported');
assert(typeof streaks !== 'undefined', 'streaks table exported');
assert(typeof hints !== 'undefined', 'hints table exported');

// --- Phones Table: New Columns ---
console.log('\n=== Phones Table: New Metadata Columns ===');
const phonesCols = getColumnNames(
  phones as unknown as Record<string, { name?: string }>,
);
assert(phonesCols.includes('release_year'), 'phones has release_year column');
assert(phonesCols.includes('price_tier'), 'phones has price_tier column');
assert(phonesCols.includes('form_factor'), 'phones has form_factor column');
assert(phonesCols.includes('difficulty'), 'phones has difficulty column');
// Existing columns still present
assert(phonesCols.includes('id'), 'phones still has id column');
assert(phonesCols.includes('brand'), 'phones still has brand column');
assert(phonesCols.includes('model'), 'phones still has model column');
assert(phonesCols.includes('image_path'), 'phones still has image_path column');
assert(phonesCols.includes('active'), 'phones still has active column');

// --- Phone Facts Table ---
console.log('\n=== Phone Facts Table ===');
const phoneFactsCols = getColumnNames(
  phoneFacts as unknown as Record<string, { name?: string }>,
);
assert(phoneFactsCols.includes('id'), 'phone_facts has id column');
assert(phoneFactsCols.includes('phone_id'), 'phone_facts has phone_id column');
assert(
  phoneFactsCols.includes('fact_text'),
  'phone_facts has fact_text column',
);
assert(
  phoneFactsCols.includes('fact_type'),
  'phone_facts has fact_type column',
);
assert(
  phoneFactsCols.includes('created_at'),
  'phone_facts has created_at column',
);

// --- Streaks Table ---
console.log('\n=== Streaks Table ===');
const streaksCols = getColumnNames(
  streaks as unknown as Record<string, { name?: string }>,
);
assert(streaksCols.includes('id'), 'streaks has id column');
assert(streaksCols.includes('user_id'), 'streaks has user_id column');
assert(
  streaksCols.includes('current_streak'),
  'streaks has current_streak column',
);
assert(streaksCols.includes('best_streak'), 'streaks has best_streak column');
assert(
  streaksCols.includes('last_played_date'),
  'streaks has last_played_date column',
);
assert(streaksCols.includes('created_at'), 'streaks has created_at column');

// --- Hints Table ---
console.log('\n=== Hints Table ===');
const hintsCols = getColumnNames(
  hints as unknown as Record<string, { name?: string }>,
);
assert(hintsCols.includes('id'), 'hints has id column');
assert(hintsCols.includes('user_id'), 'hints has user_id column');
assert(hintsCols.includes('puzzle_id'), 'hints has puzzle_id column');
assert(hintsCols.includes('hint_type'), 'hints has hint_type column');
assert(hintsCols.includes('created_at'), 'hints has created_at column');

// --- Migration SQL Validation ---
console.log('\n=== Migration SQL Validation ===');
const drizzleDir = path.join(__dirname, '../../drizzle');
const migrationFiles = fs
  .readdirSync(drizzleDir)
  .filter(f => f.endsWith('.sql'));
assert(migrationFiles.length > 0, 'migration SQL file exists');

const sqlContent = fs.readFileSync(
  path.join(drizzleDir, migrationFiles[0]),
  'utf-8',
);

// New tables present
assert(
  sqlContent.includes('CREATE TABLE "hints"'),
  'migration creates hints table',
);
assert(
  sqlContent.includes('CREATE TABLE "phone_facts"'),
  'migration creates phone_facts table',
);
assert(
  sqlContent.includes('CREATE TABLE "streaks"'),
  'migration creates streaks table',
);

// New columns on phones
assert(
  sqlContent.includes('"release_year" integer'),
  'migration adds release_year to phones',
);
assert(
  sqlContent.includes('"price_tier" varchar(20)'),
  'migration adds price_tier to phones',
);
assert(
  sqlContent.includes('"form_factor" varchar(20)'),
  'migration adds form_factor to phones',
);
assert(
  sqlContent.includes('"difficulty" varchar(10)'),
  'migration adds difficulty to phones',
);

// Foreign keys for new tables
assert(
  sqlContent.includes('hints_user_id_users_id_fk'),
  'migration has hints -> users FK',
);
assert(
  sqlContent.includes('hints_puzzle_id_daily_puzzles_id_fk'),
  'migration has hints -> daily_puzzles FK',
);
assert(
  sqlContent.includes('phone_facts_phone_id_phones_id_fk'),
  'migration has phone_facts -> phones FK',
);
assert(
  sqlContent.includes('streaks_user_id_users_id_fk'),
  'migration has streaks -> users FK',
);

// Streaks defaults
assert(
  sqlContent.includes('"current_streak" integer DEFAULT 0 NOT NULL'),
  'current_streak defaults to 0',
);
assert(
  sqlContent.includes('"best_streak" integer DEFAULT 0 NOT NULL'),
  'best_streak defaults to 0',
);

// New phone columns are nullable (no NOT NULL)
assert(
  !sqlContent.includes('"release_year" integer NOT NULL'),
  'release_year is nullable (existing rows safe)',
);
assert(
  !sqlContent.includes('"price_tier" varchar(20) NOT NULL'),
  'price_tier is nullable (existing rows safe)',
);

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
