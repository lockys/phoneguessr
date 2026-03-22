/**
 * brand-config.ts
 *
 * Maps 130+ phone brands to their GSMArena slugs and IDs.
 * Used by collect-images.ts to scrape phone listings at scale.
 *
 * Tiers control how many phones are selected per brand:
 *   major  = 5 phones (well-known global brands)
 *   mid    = 3-4 phones (regional or mid-tier brands)
 *   niche  = 2 phones (lesser-known or specialist brands)
 */

export type BrandTier = 'major' | 'mid' | 'niche';

export interface BrandConfig {
  /** Display name (exact casing for phone-data.json) */
  name: string;
  /** GSMArena URL slug (e.g. "samsung" → samsung-phones-9.php) */
  slug: string;
  /** GSMArena brand numeric ID */
  id: number;
  /** Brand tier determines selection count */
  tier: BrandTier;
  /** Number of phones to select (derived from tier if not set) */
  selectionCount: number;
  /** Difficulty assignment for phones from this brand */
  difficulty: 'easy' | 'medium' | 'hard';
}

function brand(
  name: string,
  slug: string,
  id: number,
  tier: BrandTier,
  difficulty: 'easy' | 'medium' | 'hard',
  selectionCountOverride?: number,
): BrandConfig {
  const defaultCount = tier === 'major' ? 5 : tier === 'mid' ? 3 : 2;
  return {
    name,
    slug,
    id,
    tier,
    selectionCount: selectionCountOverride ?? defaultCount,
    difficulty,
  };
}

export const BRAND_CONFIG: BrandConfig[] = [
  // === MAJOR BRANDS (5 phones each) — easy difficulty ===
  brand('Apple', 'apple', 48, 'major', 'easy'),
  brand('Samsung', 'samsung', 9, 'major', 'easy'),
  brand('Google', 'google', 107, 'major', 'easy'),
  brand('Nokia', 'nokia', 1, 'major', 'easy'),
  brand('Motorola', 'motorola', 4, 'major', 'easy'),

  // === MAJOR BRANDS — medium difficulty ===
  brand('OnePlus', 'oneplus', 95, 'major', 'medium'),
  brand('Xiaomi', 'xiaomi', 80, 'major', 'medium'),
  brand('Sony', 'sony', 7, 'major', 'medium'),
  brand('Huawei', 'huawei', 58, 'major', 'medium'),
  brand('LG', 'lg', 20, 'major', 'medium'),
  brand('HTC', 'htc', 45, 'major', 'medium'),
  brand('BlackBerry', 'blackberry', 36, 'major', 'medium'),

  // === MID BRANDS (3-4 phones each) — medium difficulty ===
  brand('OPPO', 'oppo', 82, 'mid', 'medium'),
  brand('Vivo', 'vivo', 98, 'mid', 'medium'),
  brand('Realme', 'realme', 118, 'mid', 'medium'),
  brand('Honor', 'honor', 121, 'mid', 'medium'),
  brand('Nothing', 'nothing', 128, 'mid', 'hard'),
  brand('ASUS', 'asus', 46, 'mid', 'medium'),
  brand('Lenovo', 'lenovo', 73, 'mid', 'medium'),
  brand('ZTE', 'zte', 62, 'mid', 'medium'),
  brand('Meizu', 'meizu', 74, 'mid', 'medium'),
  brand('Alcatel', 'alcatel', 5, 'mid', 'medium'),

  // === MID BRANDS — hard difficulty ===
  brand('Tecno', 'tecno', 120, 'mid', 'hard'),
  brand('Infinix', 'infinix', 119, 'mid', 'hard'),
  brand('Itel', 'itel', 131, 'mid', 'hard'),
  brand('Poco', 'poco', 126, 'mid', 'hard'),
  brand('Redmi', 'redmi', 127, 'mid', 'hard'),
  brand('iQOO', 'iqoo', 129, 'mid', 'hard'),
  brand('Nubia', 'nubia', 86, 'mid', 'hard'),
  brand('TCL', 'tcl', 123, 'mid', 'hard'),
  brand('Sharp', 'sharp', 23, 'mid', 'hard'),
  brand('Kyocera', 'kyocera', 22, 'mid', 'hard'),

  // === NICHE BRANDS (2 phones each) — hard difficulty ===
  brand('Fairphone', 'fairphone', 109, 'niche', 'hard'),
  brand('Cat', 'cat', 89, 'niche', 'hard'),
  brand('Doogee', 'doogee', 100, 'niche', 'hard'),
  brand('Ulefone', 'ulefone', 102, 'niche', 'hard'),
  brand('Oukitel', 'oukitel', 101, 'niche', 'hard'),
  brand('Cubot', 'cubot', 96, 'niche', 'hard'),
  brand('Umidigi', 'umidigi', 135, 'niche', 'hard'),
  brand('Blackview', 'blackview', 103, 'niche', 'hard'),
  brand('Wiko', 'wiko', 91, 'niche', 'hard'),
  brand('BLU', 'blu', 67, 'niche', 'hard'),
  brand('Lava', 'lava', 94, 'niche', 'hard'),
  brand('Micromax', 'micromax', 66, 'niche', 'hard'),
  brand('Karbonn', 'karbonn', 81, 'niche', 'hard'),
  brand('Intex', 'intex', 65, 'niche', 'hard'),
  brand('Panasonic', 'panasonic', 6, 'niche', 'hard'),
  brand('Philips', 'philips', 11, 'niche', 'hard'),
  brand('Siemens', 'siemens', 19, 'niche', 'hard'),
  brand('BenQ', 'benq', 32, 'niche', 'hard'),
  brand('Benefon', 'benefon', 39, 'niche', 'hard'),
  brand('Palm', 'palm', 44, 'niche', 'hard'),
  brand('Sagem', 'sagem', 42, 'niche', 'hard'),
  brand('Sendo', 'sendo', 43, 'niche', 'hard'),
  brand('Vertu', 'vertu', 60, 'niche', 'hard'),
  brand('Acer', 'acer', 59, 'niche', 'hard'),
  brand('Amazon', 'amazon', 87, 'niche', 'hard'),
  brand('Microsoft', 'microsoft', 64, 'niche', 'hard'),
  brand('Energizer', 'energizer', 113, 'niche', 'hard'),
  brand('CAT', 'cat', 89, 'niche', 'hard'),
  brand('Vodafone', 'vodafone', 53, 'niche', 'hard'),
  brand('T-Mobile', 't-mobile', 54, 'niche', 'hard'),
  brand('O2', 'o2', 55, 'niche', 'hard'),
  brand('Gigabyte', 'gigabyte', 47, 'niche', 'hard'),
  brand('i-mate', 'i-mate', 57, 'niche', 'hard'),
  brand('Garmin-Asus', 'garmin-asus', 56, 'niche', 'hard'),
  brand('Sonim', 'sonim', 83, 'niche', 'hard'),
  brand('Verykool', 'verykool', 78, 'niche', 'hard'),
  brand('Plum', 'plum', 79, 'niche', 'hard'),
  brand('NIU', 'niu', 88, 'niche', 'hard'),
  brand('Celkon', 'celkon', 84, 'niche', 'hard'),
  brand('Spice', 'spice', 68, 'niche', 'hard'),
  brand('Maxon', 'maxon', 40, 'niche', 'hard'),
  brand('Haier', 'haier', 34, 'niche', 'hard'),
  brand('Bird', 'bird', 35, 'niche', 'hard'),
  brand('Amoi', 'amoi', 38, 'niche', 'hard'),
  brand('VK Mobile', 'vk_mobile', 37, 'niche', 'hard'),
  brand('Thuraya', 'thuraya', 69, 'niche', 'hard'),
  brand('Ericsson', 'ericsson', 2, 'niche', 'hard'),
  brand('Sony Ericsson', 'sony_ericsson', 8, 'niche', 'medium'),
  brand('NEC', 'nec', 17, 'niche', 'hard'),
  brand('Mitsubishi', 'mitsubishi', 25, 'niche', 'hard'),
  brand('Toshiba', 'toshiba', 18, 'niche', 'hard'),
  brand('Bosch', 'bosch', 31, 'niche', 'hard'),
  brand('Maxwest', 'maxwest', 92, 'niche', 'hard'),
  brand('Yezz', 'yezz', 93, 'niche', 'hard'),
  brand('QMobile', 'qmobile', 99, 'niche', 'hard'),
  brand('Gionee', 'gionee', 75, 'niche', 'hard'),
  brand('Coolpad', 'coolpad', 77, 'niche', 'hard'),
  brand('XOLO', 'xolo', 85, 'niche', 'hard'),
  brand('Posh', 'posh', 97, 'niche', 'hard'),
  brand('Unnecto', 'unnecto', 90, 'niche', 'hard'),
  brand('Icemobile', 'icemobile', 76, 'niche', 'hard'),
  brand('Prestigio', 'prestigio', 61, 'niche', 'hard'),
  brand('Allview', 'allview', 63, 'niche', 'hard'),
  brand('Casio', 'casio', 24, 'niche', 'hard'),
  brand('Sewon', 'sewon', 27, 'niche', 'hard'),
  brand('Innostream', 'innostream', 29, 'niche', 'hard'),
  brand('Chea', 'chea', 30, 'niche', 'hard'),
  brand('WND', 'wnd', 49, 'niche', 'hard'),
  brand('Telit', 'telit', 51, 'niche', 'hard'),
  brand('Emporia', 'emporia', 52, 'niche', 'hard'),
  brand('HP', 'hp', 41, 'niche', 'hard'),
  brand('Dopod', 'dopod', 50, 'niche', 'hard'),
  brand('Jolla', 'jolla', 105, 'niche', 'hard'),
  brand('YU', 'yu', 108, 'niche', 'hard'),
  brand('Essential', 'essential', 112, 'niche', 'hard'),
  brand('Razer', 'razer', 114, 'niche', 'hard'),
  brand('Opsson', 'opsson', 70, 'niche', 'hard'),
  brand('Celcom', 'celcom', 71, 'niche', 'hard'),
  brand('Zen', 'zen', 72, 'niche', 'hard'),
  brand('iNew', 'inew', 104, 'niche', 'hard'),
  brand('Wileyfox', 'wileyfox', 111, 'niche', 'hard'),
  brand('Centric', 'centric', 115, 'niche', 'hard'),
  brand('Leagoo', 'leagoo', 106, 'niche', 'hard'),
  brand('Vernee', 'vernee', 110, 'niche', 'hard'),
  brand('Maze', 'maze', 116, 'niche', 'hard'),
  brand('Sugar', 'sugar', 117, 'niche', 'hard'),
  brand('Lemon', 'lemon', 122, 'niche', 'hard'),
  brand('Vsmart', 'vsmart', 124, 'niche', 'hard'),
  brand('Vsun', 'vsun', 125, 'niche', 'hard'),
  brand('OnePlus Nord', 'oneplus', 95, 'niche', 'medium'), // subset of OnePlus
  brand('Roku', 'roku', 130, 'niche', 'hard'),
  brand('ZEN', 'zen', 72, 'niche', 'hard'),
  brand('MiOne', 'mione', 132, 'niche', 'hard'),
  brand('Ulefone Armor', 'ulefone', 102, 'niche', 'hard'),
  brand('Crosscall', 'crosscall', 133, 'niche', 'hard'),
  brand('Bea-fon', 'bea-fon', 134, 'niche', 'hard'),
  brand('AGM', 'agm', 136, 'niche', 'hard'),
  brand('Oscal', 'oscal', 137, 'niche', 'hard'),
];

/** Get selection count for a brand tier */
export function getSelectionCount(tier: BrandTier): number {
  switch (tier) {
    case 'major':
      return 5;
    case 'mid':
      return 3;
    case 'niche':
      return 2;
  }
}

/** Get unique brands (deduplicated by slug+id) */
export function getUniqueBrands(): BrandConfig[] {
  const seen = new Set<string>();
  return BRAND_CONFIG.filter(b => {
    const key = `${b.slug}-${b.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** All unique brand display names for validation */
export const ALL_BRAND_NAMES = [...new Set(BRAND_CONFIG.map(b => b.name))];
