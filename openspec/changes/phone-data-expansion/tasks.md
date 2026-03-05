## 1. Schema Changes

- [ ] 1.1 Add `releaseYear` (integer), `priceTier` (varchar 20), `formFactor` (varchar 20), and `difficulty` (varchar 20) columns to `phones` table in `phoneguessr/src/db/schema.ts`
- [ ] 1.2 Define TypeScript union types for priceTier (`'budget' | 'mid' | 'flagship'`), formFactor (`'bar' | 'flip' | 'fold'`), and difficulty (`'easy' | 'medium' | 'hard'`)
- [ ] 1.3 Update MockPhone interface in `phoneguessr/src/mock/data.ts` to include releaseYear, priceTier, formFactor, and difficulty fields

## 2. Seed Data Expansion

- [ ] 2.1 Add metadata fields (releaseYear, priceTier, formFactor, difficulty) to all 20 existing entries in `phoneguessr/src/db/phone-data.json`
- [ ] 2.2 Add phones from Xiaomi (8 phones), Sony (6 phones), and Motorola (8 phones) to seed data
- [ ] 2.3 Add phones from OnePlus (expand to 8), Nothing (expand to 5), and Google (expand to 8) to seed data
- [ ] 2.4 Add phones from OPPO (5), vivo (4), Realme (4), and Honor (4) to seed data
- [ ] 2.5 Add phones from Huawei (4), ASUS (3), ZTE/Nubia (3) to seed data
- [ ] 2.6 Expand Apple (to 18) and Samsung (to 18) entries with full model year coverage
- [ ] 2.7 Verify total catalog reaches 120+ phones with all metadata fields complete

## 3. Mock Data Update

- [ ] 3.1 Expand MOCK_PHONES array to 50+ entries covering all 15+ brands with all metadata fields
- [ ] 3.2 Ensure mock data difficulty distribution: ~25% easy, ~25% medium, ~20% hard minimum
- [ ] 3.3 Verify every MOCK_PHONES entry has non-null releaseYear, priceTier, formFactor, and difficulty

## 4. Phone Images

- [ ] 4.1 Source and add phone images for all new phones following naming convention `{brand-lowercase}-{model-kebab-case}.jpg`
- [ ] 4.2 Verify all images meet minimum 800x1200px resolution and are under 200KB
- [ ] 4.3 Verify every phone in seed data has a corresponding image file in `config/public/phones/`

## 5. Validation

- [ ] 5.1 Create a validation script that checks seed data completeness (all fields present, valid enum values, no duplicates, image files exist)
- [ ] 5.2 Verify brand distribution: no single brand exceeds 20% of catalog
- [ ] 5.3 Verify difficulty distribution meets minimum thresholds (25% easy, 25% medium, 20% hard)
- [ ] 5.4 Verify release year coverage spans at least 4 different years
- [ ] 5.5 Run seed script against local database to confirm data loads correctly

## 6. Update API (if needed)

- [ ] 6.1 Update `GET /api/phones` endpoint to include new metadata fields in response if consumed by hint system
- [ ] 6.2 Update mock guess feedback logic if it needs metadata awareness
- [ ] 6.3 Update seed script (`phoneguessr/src/db/seed.ts`) to handle new fields
