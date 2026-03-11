## Context

PhoneGuessr currently has 20 phones from 5 brands with real images stored in `config/public/phones/`. The game needs 400-650+ phones spanning 130+ brands to support long-term replayability and broad brand recognition challenges. The existing `phone-data.json` seed file and `phones` table schema already support the required fields (brand, model, imagePath, releaseYear, priceTier, formFactor, difficulty, active).

The `generate-placeholders.ts` script exists but only generates SVG placeholders -- it is not usable for sourcing real photos. A new automated pipeline is needed to collect, process, and catalog real phone images at scale.

Image and phone data currently lives in:
1. `phoneguessr/src/db/phone-data.json` -- seed data for PostgreSQL
2. `phoneguessr/src/mock/data.ts` -- MockPhone array for local dev
3. `phoneguessr/config/public/phones/` -- image files (jpg/png, ~20-1800KB each)

## Goals / Non-Goals

**Goals:**
- Build an automated Node.js script to scrape phone listings and download images from GSMArena
- Process images to consistent dimensions and format (JPEG, max 800px width)
- Select 2-5 recognizable/popular models per brand across 130+ brands
- Generate updated `phone-data.json` entries with metadata (releaseYear, priceTier, formFactor, difficulty)
- Implement rate limiting and polite scraping practices
- Produce a quality-filtered catalog of 400-650+ phones

**Non-Goals:**
- Building a persistent scraping service or cron job (this is a one-shot collection script)
- CDN or S3 hosting (images stay in git for now)
- Automated difficulty assignment based on play data (manual heuristics for now)
- Scraping phone specs beyond what is needed for game metadata
- Building a UI for reviewing/curating scraped phones

## Decisions

### 1. GSMArena as the image source

**Decision:** Scrape phone images from GSMArena's phone finder pages.

**Alternatives considered:**
- *Official press kits from manufacturers:* Inconsistent availability, requires visiting 130+ different websites with different structures. Not automatable at scale.
- *PhoneArena, GSMChoice:* Smaller catalog, less consistent image quality.
- *Wikipedia/Wikimedia Commons:* Inconsistent image quality and availability. Many phones lack photos entirely.

**Rationale:** GSMArena has the largest, most comprehensive phone database with consistent image formatting. Every listed phone has a stock product photo in a predictable page structure. The catalog covers the full range of requested brands including obscure and discontinued ones. Images are stock press photos suitable for the guessing game.

### 2. Node.js with fetch + cheerio for scraping

**Decision:** Use a Node.js script with native `fetch` and `cheerio` for HTML parsing.

**Alternatives considered:**
- *Puppeteer/Playwright:* Full browser automation. Overkill for static content pages. Heavier dependency, slower execution.
- *Python (BeautifulSoup/Scrapy):* Would require a separate runtime and toolchain outside the existing TypeScript/Node.js project.
- *curl + shell scripts:* Hard to maintain, no structured HTML parsing, poor error handling.

**Rationale:** The project already uses Node.js/TypeScript. GSMArena pages are server-rendered HTML (no client-side rendering needed), so cheerio is sufficient. Native fetch is available in Node 18+. No extra runtime dependencies.

### 3. Image processing with sharp (max 800px width, JPEG output)

**Decision:** Resize all images to max 800px width (maintaining aspect ratio), convert to JPEG format, and optimize quality to target under 200KB per file.

**Alternatives considered:**
- *Keep original dimensions:* Images vary wildly (100px to 2000px+). Inconsistent game experience and large storage.
- *Fixed dimensions (e.g., 400x800):* Would distort aspect ratios for phones with different proportions.
- *WebP format:* Better compression but less universal browser support. JPG is already the existing standard in the project.
- *Max 400px width:* Too small for good detail on retina displays.

**Rationale:** 800px width provides enough detail for the crop-reveal game mechanic on retina displays while keeping file sizes reasonable. JPEG is consistent with existing images in the project. Sharp is the standard Node.js image processing library, already likely in the dependency tree or trivially installable.

### 4. Per-brand selection: 2-5 recognizable models

**Decision:** For each of the 130+ brands, select 2-5 of the most recognizable or popular models. Prioritize phones that are visually distinctive and identifiable.

**Alternatives considered:**
- *Every phone ever made:* Would produce thousands of entries, many visually identical. Not useful for the game.
- *Only flagships:* Many brands (especially budget/regional ones) don't have clear flagships. Would exclude interesting variety.
- *Fixed count per brand (e.g., exactly 3):* Too rigid. Major brands like Apple/Samsung deserve more entries; obscure brands may only have 2 identifiable phones.

**Rationale:** The goal is a broad, interesting catalog -- not exhaustiveness. 2-5 per brand across 130+ brands yields 260-650 phones, which is enough for 1-2 years of daily puzzles. Selection criteria:
1. Phones with distinctive visual designs (unique camera arrangements, unusual materials, etc.)
2. Iconic/popular models that phone enthusiasts would recognize
3. Coverage across different eras when possible (classic Nokia, modern Samsung, etc.)
4. Skip phones that look identical to others from the same brand

### 5. Rate limiting: 1-2 second delays between requests

**Decision:** Add a 1-2 second random delay between HTTP requests. Include a User-Agent header. Respect robots.txt. Limit concurrent requests to 1.

**Alternatives considered:**
- *No delays:* Risks IP blocking and is impolite to the server.
- *5+ second delays:* Overly cautious. Would make scraping 130+ brands take many hours.
- *Concurrent requests with pool:* Higher throughput but more likely to trigger rate limiting.

**Rationale:** Sequential requests with 1-2 second delays is polite, avoids rate limiting, and completes the full scrape in a reasonable time (a few hours for the initial run). The script is run once, not continuously.

### 6. Two-phase approach: scrape then curate

**Decision:** The script operates in two phases:
1. **Scrape phase:** Download all candidate images for each brand into a staging directory
2. **Curate phase:** A separate pass (or manual review) selects the best 2-5 per brand and generates the final `phone-data.json` entries

**Alternatives considered:**
- *Single pass with auto-selection:* Harder to get right. May miss good phones or include bad images.
- *Fully manual:* Does not scale to 130+ brands.

**Rationale:** The two-phase approach lets the script cast a wide net while keeping human judgment in the loop for final selection. The curate phase can use heuristics (sort by popularity/views on GSMArena) with manual override.

### 7. Metadata extraction from GSMArena

**Decision:** Extract releaseYear, formFactor, and approximate priceTier from GSMArena listing pages. Difficulty is assigned via heuristics based on brand recognition tier.

**Rationale:** GSMArena pages contain release date and phone type information in structured format. Price tier can be approximated from the phone's market segment (flagship vs mid-range vs budget series names). This avoids manual data entry for 400+ phones.

### 8. File naming convention: continue existing pattern

**Decision:** Continue the existing `{brand-lowercase}-{model-kebab-case}.jpg` naming convention already established in the project.

**Rationale:** Consistency with the 20 existing images. The pattern is already used in `phone-data.json` and the seed script.

## Architecture

```
phoneguessr/scripts/collect-images.ts
  |
  |-- fetch brand listing pages from GSMArena
  |-- parse phone model links with cheerio
  |-- fetch individual phone pages
  |-- download phone images
  |-- process with sharp (resize, convert to JPEG, optimize)
  |-- save to config/public/phones/
  |-- generate phone-data entries (JSON)
  |
  v
phoneguessr/scripts/curate-phones.ts (optional)
  |
  |-- read scraped data
  |-- apply selection heuristics (popularity, visual distinctiveness)
  |-- allow manual overrides via config file
  |-- output final phone-data.json
```

## Risks / Trade-offs

- **[GSMArena structure changes]** -- The script depends on specific HTML structure. If GSMArena redesigns, the scraper breaks. Mitigate by keeping the scraper simple and well-documented so it is easy to update selectors.
- **[Image quality variance]** -- Some phones on GSMArena have low-resolution or render images instead of photos. Mitigate by filtering out images below minimum dimensions and flagging renders for manual review.
- **[Rate limiting / IP blocking]** -- Aggressive scraping could get blocked. Mitigate with delays, user-agent headers, and running from a single machine.
- **[Repository size]** -- 400-650 JPEG images at ~100-200KB each = 40-130MB. This is substantial for a git repo. Acceptable for now; revisit with CDN if it becomes a problem.
- **[Legal/ToS]** -- Scraping GSMArena may violate their ToS. The images are stock press photos from manufacturers, but GSMArena hosts them. Mitigate by using images for a non-commercial game and keeping the scraper private (not distributed). Consider reaching out to GSMArena for permission if the project goes public.
- **[Brand name inconsistencies]** -- GSMArena may use different brand name casing or groupings than expected. Mitigate by maintaining a brand name mapping config.
- **[Stale data]** -- The script captures a snapshot. New phone releases after scraping are not included. Mitigate by making the script re-runnable with incremental updates.
