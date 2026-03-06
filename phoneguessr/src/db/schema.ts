import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 200 }).notNull(),
  imagePath: text('image_path').notNull(),
  releaseYear: integer('release_year'),
  priceTier: varchar('price_tier', { length: 20 }),
  formFactor: varchar('form_factor', { length: 20 }),
  difficulty: varchar('difficulty', { length: 10 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const dailyPuzzles = pgTable(
  'daily_puzzles',
  {
    id: serial('id').primaryKey(),
    phoneId: integer('phone_id')
      .notNull()
      .references(() => phones.id),
    puzzleDate: date('puzzle_date').notNull(),
    puzzleNumber: integer('puzzle_number').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [uniqueIndex('daily_puzzles_date_idx').on(table.puzzleDate)],
);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: varchar('google_id', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const guesses = pgTable('guesses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  puzzleId: integer('puzzle_id')
    .notNull()
    .references(() => dailyPuzzles.id),
  phoneId: integer('phone_id')
    .notNull()
    .references(() => phones.id),
  guessNumber: integer('guess_number').notNull(),
  feedback: varchar('feedback', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  puzzleId: integer('puzzle_id')
    .notNull()
    .references(() => dailyPuzzles.id),
  score: real('score'),
  guessCount: integer('guess_count').notNull(),
  isWin: boolean('is_win').notNull(),
  elapsedSeconds: real('elapsed_seconds').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const phoneFacts = pgTable('phone_facts', {
  id: serial('id').primaryKey(),
  phoneId: integer('phone_id')
    .notNull()
    .references(() => phones.id),
  factText: text('fact_text').notNull(),
  factType: varchar('fact_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const streaks = pgTable('streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastPlayedDate: date('last_played_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const hints = pgTable('hints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  puzzleId: integer('puzzle_id')
    .notNull()
    .references(() => dailyPuzzles.id),
  hintType: varchar('hint_type', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
