# Phone Data Schema and Pipeline Design

## Context

PhoneGuessr currently has 20 phones across 5 brands with a minimal schema (`id`, `brand`, `model`, `imagePath`, `active`). The game needs:

- **120+ phones** from 15+ brands for 4+ months of unique daily puzzles
- **Rich metadata** (release year, price tier, form factor) for proximity hints
- **Phone facts** for "yesterday's reveal" feature
- **Streak tracking** for player engagement
- **Difficulty classification** for balanced puzzle selection

## ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────┐
│            phones                │
├─────────────────────────────────┤
│ id          serial PK           │
│ brand       varchar(100) NOT NULL│
│ model       varchar(200) NOT NULL│
│ imagePath   text NOT NULL        │
│ active      boolean DEFAULT true │
│ releaseYear integer NULL         │  ← NEW
│ priceTier   varchar(20) NULL     │  ← NEW (budget | mid-range | flagship)
│ formFactor  varchar(20) NULL     │  ← NEW (bar | flip | fold)
│ region      varchar(50) NULL     │  ← NEW (global | china | india | japan)
│ createdAt   timestamp            │
├─────────────────────────────────┤
│ INDEX brand_idx ON (brand)       │
│ UNIQUE brand_model_idx ON        │
│   (brand, model)                 │
└──────────┬──────────────────────┘
           │ 1
           │
           │ N
┌──────────┴──────────────────────┐
│         phone_facts              │
├─────────────────────────────────┤
│ id          serial PK            │
│ phoneId     integer FK → phones  │
│ factType    varchar(50) NOT NULL │
│ factText    text NOT NULL        │
│ locale      varchar(10) DEFAULT  │
│             'en'                 │
│ createdAt   timestamp            │
├─────────────────────────────────┤
│ INDEX phone_facts_phone_idx      │
│   ON (phoneId)                   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│            streaks               │
├─────────────────────────────────┤
│ id             serial PK         │
│ userId         integer FK → users│
│ currentStreak  integer DEFAULT 0 │
│ bestStreak     integer DEFAULT 0 │
│ lastPlayedDate date NULL         │
│ updatedAt      timestamp         │
├─────────────────────────────────┤
│ UNIQUE streaks_user_idx          │
│   ON (userId)                    │
└─────────────────────────────────┘

Existing tables (unchanged):
  daily_puzzles, users, guesses, results
```

## Design Decisions

### 1. Add columns to phones table (not a metadata table)

The new fields (`releaseYear`, `priceTier`, `formFactor`, `region`) are 1:1 with each phone and always queried alongside existing fields (for proximity hints, autocomplete filtering). A separate metadata table would add unnecessary joins.

All new columns are **nullable** — this allows gradual data population and existing rows to remain valid without migration backfill.

### 2. Difficulty: Computed, not stored

Difficulty is a function of metadata, not independent data:

```typescript
function computeDifficulty(phone: Phone): 'easy' | 'medium' | 'hard' {
  const brandPopularity: Record<string, number> = {
    'Apple': 3, 'Samsung': 3, 'Google': 2,
    'OnePlus': 1, 'Xiaomi': 1, 'Nothing': 1, ...
  };
  const popularity = brandPopularity[phone.brand] ?? 1;
  const recency = phone.releaseYear
    ? Math.max(0, new Date().getFullYear() - phone.releaseYear)
    : 2;

  // Popular brand + recent = easy; obscure + old = hard
  if (popularity >= 3 && recency <= 1) return 'easy';
  if (popularity <= 1 || recency >= 3) return 'hard';
  return 'medium';
}
```

Storing difficulty as a column creates staleness risk (brands gain/lose popularity, time passes). Computing it keeps it always accurate.

### 3. Seed data pipeline

**Structure:** Single `phone-data.json` with expanded fields:

```json
{
  "brand": "Apple",
  "model": "iPhone 16 Pro Max",
  "imagePath": "/public/phones/apple-iphone-16-pro-max.jpg",
  "releaseYear": 2024,
  "priceTier": "flagship",
  "formFactor": "bar",
  "region": "global"
}
```

**Seed script updates:**
- Read from `phone-data.json` (same as today)
- Insert all fields including new nullable columns
- Use `onConflictDoUpdate` keyed on `(brand, model)` unique index for idempotent re-runs
- Add `phone_facts` seeding from optional `facts` array in JSON

**Phone facts in JSON:**
```json
{
  "brand": "Samsung",
  "model": "Galaxy Z Fold 6",
  ...
  "facts": [
    { "type": "feature", "text": "First Galaxy Fold with a slimmer hinge design" },
    { "type": "spec", "text": "7.6-inch inner display, Snapdragon 8 Gen 3" }
  ]
}
```

### 4. Image storage: Keep in git

At current scale (42 images, 40-130KB each, ~3MB total), git storage in `config/public/phones/` is fine. CDN/S3 adds deployment complexity with no user-facing benefit.

**Revisit when:** total image assets exceed 50MB or phone count exceeds 500.

**Image naming convention:** `{brand}-{model-kebab-case}.{jpg|png}`

### 5. Migration strategy

1. **Add new nullable columns** to `phones` table — no breaking change
2. **Add `phone_facts` and `streaks` tables** — purely additive
3. **Add unique index** on `(brand, model)` for idempotent seeding
4. **Run updated seed script** to populate new fields for existing rows
5. **No data deletion or column removal** — fully backwards compatible

Migration order:
```
1. ALTER TABLE phones ADD COLUMN release_year integer;
2. ALTER TABLE phones ADD COLUMN price_tier varchar(20);
3. ALTER TABLE phones ADD COLUMN form_factor varchar(20);
4. ALTER TABLE phones ADD COLUMN region varchar(50);
5. CREATE UNIQUE INDEX brand_model_idx ON phones(brand, model);
6. CREATE TABLE phone_facts (...);
7. CREATE TABLE streaks (...);
8. Run seed script to populate data
```

With Drizzle ORM, steps 1-7 are handled by `drizzle-kit generate` + `drizzle-kit migrate`.

## Data Pipeline Flow

```
phone-data.json (source of truth)
       │
       ▼
   seed.ts (reads JSON, inserts/upserts into DB)
       │
       ├──▶ phones table (with metadata)
       └──▶ phone_facts table (from facts array)

mock/data.ts (subset for dev mode)
       │
       ▼
   MockPhone interface (extended with metadata)
```

## Mock Data Updates

`MockPhone` interface gains optional metadata fields:

```typescript
export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imagePath: string;
  releaseYear?: number;
  priceTier?: 'budget' | 'mid-range' | 'flagship';
  formFactor?: 'bar' | 'flip' | 'fold';
  region?: string;
}
```

Mock array expanded to ~50 phones with metadata populated for proximity hint testing.

## Phone Catalog Expansion Targets

| Brand     | Target Count | Price Tiers              |
|-----------|-------------|--------------------------|
| Apple     | 15-20       | flagship                 |
| Samsung   | 15-20       | budget, mid-range, flagship |
| Google    | 8-10        | mid-range, flagship      |
| OnePlus   | 6-8         | mid-range, flagship      |
| Xiaomi    | 10-12       | budget, mid-range, flagship |
| Nothing   | 4-5         | mid-range                |
| Sony      | 4-5         | flagship                 |
| Motorola  | 6-8         | budget, mid-range        |
| OPPO      | 5-6         | mid-range, flagship      |
| Huawei    | 5-6         | flagship                 |
| Vivo      | 4-5         | mid-range, flagship      |
| Asus      | 3-4         | flagship (ROG Phone)     |
| Realme    | 4-5         | budget, mid-range        |
| Honor     | 3-4         | mid-range, flagship      |
| Nokia     | 2-3         | budget                   |
| **Total** | **120-140** |                          |

## Fact Types

| factType    | Description                    | Example                            |
|-------------|--------------------------------|------------------------------------|
| `feature`   | Notable hardware/software feature | "First phone with Dynamic Island" |
| `spec`      | Key specification               | "6.7-inch OLED, Snapdragon 8 Gen 3" |
| `trivia`    | Fun fact about the phone        | "Named after the Pixel art style" |
| `release`   | Launch context                  | "Launched alongside iOS 18"       |

## Constraints & Validation

- `priceTier` must be one of: `budget`, `mid-range`, `flagship`
- `formFactor` must be one of: `bar`, `flip`, `fold`
- `releaseYear` must be between 2020 and current year + 1
- `region` is free text but recommended values: `global`, `china`, `india`, `japan`
- Each phone should have at least 1 fact in `phone_facts`
- `phone_facts.locale` defaults to `'en'` — i18n facts added later
