import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 200 }).notNull(),
  imagePath: text('image_path').notNull(),
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
