/**
 * collect-images.ts
 *
 * Scrapes phone listings from GSMArena, downloads product images,
 * and prepares them for the PhoneGuessr game catalog.
 *
 * Usage:
 *   npx tsx phoneguessr/scripts/collect-images.ts [--brand <slug>] [--dry-run]
 *
 * Options:
 *   --brand <slug>   Only scrape the specified brand slug (e.g., "apple")
 *   --dry-run        Fetch and parse listings but do not download images
 *   --help           Show this help message
 */

import * as cheerio from 'cheerio';

export const BASE_URL = 'https://www.gsmarena.com';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface PhoneLink {
  /** Display name of the phone model (e.g. "Galaxy S26 Ultra") */
  name: string;
  /** Relative path on GSMArena (e.g. "samsung_galaxy_s26_ultra_5g-14320.php") */
  href: string;
  /** Full URL of the thumbnail image */
  thumbnail: string;
}

export interface BrandListingResult {
  phones: PhoneLink[];
  /** Full URL of the next page, or null if this is the last page */
  nextPageUrl: string | null;
}

/**
 * Parse a GSMArena brand listing page HTML and extract phone links and pagination.
 *
 * The brand listing page has this structure:
 *   <div class="makers">
 *     <ul>
 *       <li>
 *         <a href="{slug}.php">
 *           <img src="{thumb}" title="...">
 *           <strong><span>{Model Name}</span></strong>
 *         </a>
 *       </li>
 *       ...
 *     </ul>
 *   </div>
 *   <div class="review-nav-v2">
 *     <div class="nav-pages">
 *       <a href="#" class="prevnextbuttondis">◄</a>
 *       <strong>1</strong>
 *       <a href="samsung-phones-f-9-0-p2.php">2</a>
 *       <a href="samsung-phones-f-9-0-p2.php" class="prevnextbutton" title="Next page">►</a>
 *     </div>
 *   </div>
 */
export function parseBrandListingPage(html: string): BrandListingResult {
  const $ = cheerio.load(html);
  const phones: PhoneLink[] = [];

  $('div.makers ul li a').each((_, el) => {
    const link = $(el);
    const href = link.attr('href');
    const name = link.find('strong span').text().trim();
    const rawSrc = link.find('img').attr('src') || '';

    if (!href || !name) return;

    const thumbnail = rawSrc.startsWith('http') ? rawSrc : `${BASE_URL}/${rawSrc}`;

    phones.push({ name, href, thumbnail });
  });

  // Find next page: the "►" button with class prevnextbutton (not prevnextbuttondis)
  const nextHref = $('a.prevnextbutton[title="Next page"]').attr('href');
  const nextPageUrl =
    nextHref && nextHref !== '#' ? `${BASE_URL}/${nextHref}` : null;

  return { phones, nextPageUrl };
}

/**
 * Fetch a URL with rate limiting (1–2s random delay) and a browser-like User-Agent.
 * Retries up to 3 times with exponential backoff on failure.
 */
export async function fetchPage(url: string, maxRetries = 3): Promise<string> {
  // Polite delay: 1–2 seconds
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
      }

      return await response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const backoff = attempt * 2000;
        console.warn(
          `  Attempt ${attempt} failed (${lastError.message}), retrying in ${backoff}ms…`,
        );
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Fetch all phone listings for a brand, following pagination until no next page.
 * Returns a flat list of all phone links across all pages.
 */
export async function fetchBrandPhones(
  brandSlug: string,
  brandId: number,
): Promise<PhoneLink[]> {
  const allPhones: PhoneLink[] = [];
  let currentUrl: string | null = `${BASE_URL}/${brandSlug}-phones-${brandId}.php`;
  let page = 1;

  while (currentUrl) {
    console.log(`  [page ${page}] ${currentUrl}`);
    const html = await fetchPage(currentUrl);
    const { phones, nextPageUrl } = parseBrandListingPage(html);

    allPhones.push(...phones);
    currentUrl = nextPageUrl;
    page++;
  }

  return allPhones;
}

// --- CLI entry point ---

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx phoneguessr/scripts/collect-images.ts [options]

Options:
  --brand <slug>   Only scrape the specified brand slug (e.g., "apple")
  --dry-run        Fetch and parse listings but do not download images
  --help           Show this help message
    `.trim());
    process.exit(0);
  }

  const brandIndex = args.indexOf('--brand');
  const brandFilter = brandIndex !== -1 ? args[brandIndex + 1] : null;
  const dryRun = args.includes('--dry-run');

  console.log('PhoneGuessr image collector');
  console.log('===========================');
  if (dryRun) console.log('DRY RUN – no images will be downloaded');
  if (brandFilter) console.log(`Filtering to brand: ${brandFilter}`);
  console.log();

  // Placeholder: full brand list and pipeline will be wired in subsequent tasks
  console.log('Brand listing parser ready. Run with --brand <slug> to test a specific brand.');
}
