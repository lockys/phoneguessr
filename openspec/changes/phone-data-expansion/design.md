## Context

PhoneGuessr has 20 phones from 5 brands in both its PostgreSQL database (via `phone-data.json` seed) and mock data (`MOCK_PHONES` array). The `phones` table schema is minimal: id, brand, model, imagePath, active, createdAt. The game needs 120+ phones with richer metadata to support months of unique puzzles and planned features (hints, difficulty tiers, "almost" feedback).

Current phone data lives in three places:
1. `phoneguessr/src/db/phone-data.json` — seed data for PostgreSQL
2. `phoneguessr/src/mock/data.ts` — MockPhone array for local dev
3. `config/public/phones/` — image files

## Goals / Non-Goals

**Goals:**
- Define the expanded phone record schema with metadata fields
- Set catalog size and brand distribution targets
- Establish image quality and naming standards
- Define the process for curating and adding phones
- Ensure mock data stays useful for local development

**Non-Goals:**
- Sourcing or adding the actual 120+ phone images (separate BE task)
- Running database migrations (downstream TL/BE task)
- Building automated scraping tools (manual curation for v1)
- CDN or S3 image hosting (keep images in git for now)
- API response shape changes (handled by API design task)

## Decisions

### 1. Add columns to existing `phones` table (not a separate metadata table)

**Decision:** Add `releaseYear`, `priceTier`, `formFactor`, and `difficulty` directly to the `phones` table.

**Alternatives considered:**
- *Separate `phone_metadata` table with FK to phones* — Adds join complexity for no real benefit. These fields are read with every phone query.
- *JSON column for extensible metadata* — Loses type safety and queryability.

**Rationale:** The metadata is small, fixed, and always queried together with brand/model. Flat is better than nested.

### 2. Use string enums stored as varchar (not PostgreSQL enums)

**Decision:** Store priceTier, formFactor, and difficulty as varchar with application-level validation.

**Alternatives considered:**
- *PostgreSQL ENUM types* — Harder to migrate when adding values. Drizzle ORM support is inconsistent.
- *Integer codes with lookup* — Obscures meaning in the database.

**Rationale:** Varchar with constrained values is the simplest approach. TypeScript union types enforce correctness at the application layer. Adding new values requires no migration.

### 3. Manual curation for v1 (not scraping or community submission)

**Decision:** Phone data is manually curated by the team, maintained as a JSON seed file.

**Alternatives considered:**
- *Web scraping from GSMArena/PhoneArena* — Legal risk, brittle, overkill for 120 phones.
- *Community submission with review* — Needs moderation UI, trust system. Too complex for v1.

**Rationale:** 120 phones is a tractable manual task. JSON seed file is version-controlled, reviewable, and the pipeline already exists. Revisit for scale beyond 500 phones.

### 4. Keep images in git (not CDN/S3)

**Decision:** Phone images stay in `config/public/phones/` within the repo.

**Alternatives considered:**
- *S3 + CloudFront CDN* — Adds infrastructure complexity, IAM, deployment pipeline changes.
- *Vercel Blob storage* — Adds SDK dependency and runtime cost.

**Rationale:** 120 JPGs at ~100KB each ≈ 12MB total. Well within git's comfort zone. Images rarely change. Simplicity wins for v1.

### 5. Difficulty assignment: manual tag based on brand recognition

**Decision:** Difficulty is manually assigned per phone using simple heuristics:
- **easy** — Flagship phones from top-5 global brands (Apple, Samsung, Google)
- **medium** — Mid-range phones or flagships from well-known brands (OnePlus, Xiaomi, Nothing, Sony, Motorola)
- **hard** — Regional brands, budget phones, or visually similar models (OPPO, vivo, Realme, Honor, Huawei, ASUS, ZTE/Nubia)

**Rationale:** Algorithmic difficulty would require play data we don't have yet. Manual tagging with clear heuristics is good enough for launch. Can be refined with real user data later.

### 6. Mock data grows to 50 phones (not full 120)

**Decision:** MOCK_PHONES array targets 50 phones covering all 15+ brands with all metadata fields.

**Rationale:** 50 is enough for meaningful autocomplete testing and variety, without making the mock data file unwieldy. Production seed has the full 120+.

## Risks / Trade-offs

- **[Image sourcing effort]** → 120 press kit photos require significant manual work. Mitigate by prioritizing major brands first and adding niche brands incrementally.
- **[Difficulty balance]** → Manual difficulty tags may not match actual player experience. Mitigate by tracking solve rates and adjusting tags post-launch.
- **[Seed file size]** → 120-entry JSON grows to ~15KB. Acceptable, but keep format flat to maintain readability.
- **[Mock/production drift]** → MockPhone interface must stay in sync with schema changes. Mitigate by deriving MockPhone type from the schema or sharing a common type.
- **[Brand bias]** → Heavy weighting toward Apple/Samsung may bore players. Mitigate by ensuring difficulty rotation in puzzle selection.
