import { describe, expect, it } from 'vitest';
import { BASE_URL, parseBrandListingPage } from '../scripts/collect-images';

// Minimal GSMArena brand listing HTML fixture (mirrors the real page structure)
function makeBrandListingHtml({
  phones = [] as Array<{ href: string; name: string; thumbnail: string }>,
  nextPageHref = null as string | null,
} = {}) {
  const items = phones
    .map(
      ({ href, name, thumbnail }) =>
        `<li><a href="${href}"><img src="${thumbnail}" title="${name}"><strong><span>${name}</span></strong></a></li>`,
    )
    .join('\n');

  const navPages = nextPageHref
    ? `<div class="review-nav-v2"><div class="nav-pages">
         <a href="#" class="prevnextbuttondis">◄</a>
         <strong>1</strong>
         <a href="${nextPageHref}" class="prevnextbutton" title="Next page">►</a>
       </div></div>`
    : `<div class="review-nav-v2"><div class="nav-pages">
         <a href="#" class="prevnextbuttondis">◄</a>
         <strong>3</strong>
         <a href="#" class="prevnextbuttondis">►</a>
       </div></div>`;

  return `<!doctype html><html><body>
    <div class="makers"><ul>${items}</ul></div>
    ${navPages}
  </body></html>`;
}

describe('parseBrandListingPage', () => {
  it('extracts phone name and href', () => {
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'apple_iphone_16_pro-12345.php',
          name: 'iPhone 16 Pro',
          thumbnail:
            'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
        },
      ],
    });

    const { phones } = parseBrandListingPage(html);

    expect(phones).toHaveLength(1);
    expect(phones[0].name).toBe('iPhone 16 Pro');
    expect(phones[0].href).toBe('apple_iphone_16_pro-12345.php');
  });

  it('returns full thumbnail URL when src is already absolute', () => {
    const absoluteThumb =
      'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg';
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'apple_iphone_16_pro-12345.php',
          name: 'iPhone 16 Pro',
          thumbnail: absoluteThumb,
        },
      ],
    });

    const { phones } = parseBrandListingPage(html);
    expect(phones[0].thumbnail).toBe(absoluteThumb);
  });

  it('prepends BASE_URL when thumbnail src is relative', () => {
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'nokia_3310-100.php',
          name: 'Nokia 3310',
          thumbnail: 'vv/bigpic/nokia-3310.jpg',
        },
      ],
    });

    const { phones } = parseBrandListingPage(html);
    expect(phones[0].thumbnail).toBe(`${BASE_URL}/vv/bigpic/nokia-3310.jpg`);
  });

  it('extracts multiple phones from a single page', () => {
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'samsung_galaxy_s26-1.php',
          name: 'Galaxy S26',
          thumbnail: 'https://example.com/s26.jpg',
        },
        {
          href: 'samsung_galaxy_s26_ultra-2.php',
          name: 'Galaxy S26 Ultra',
          thumbnail: 'https://example.com/s26u.jpg',
        },
        {
          href: 'samsung_galaxy_z_flip7-3.php',
          name: 'Galaxy Z Flip7',
          thumbnail: 'https://example.com/flip7.jpg',
        },
      ],
    });

    const { phones } = parseBrandListingPage(html);
    expect(phones).toHaveLength(3);
    expect(phones.map(p => p.name)).toEqual([
      'Galaxy S26',
      'Galaxy S26 Ultra',
      'Galaxy Z Flip7',
    ]);
  });

  it('returns nextPageUrl when a next-page button is present', () => {
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'samsung_galaxy_s26-1.php',
          name: 'Galaxy S26',
          thumbnail: 'https://example.com/s26.jpg',
        },
      ],
      nextPageHref: 'samsung-phones-f-9-0-p2.php',
    });

    const { nextPageUrl } = parseBrandListingPage(html);
    expect(nextPageUrl).toBe(`${BASE_URL}/samsung-phones-f-9-0-p2.php`);
  });

  it('returns null nextPageUrl on the last page', () => {
    const html = makeBrandListingHtml({
      phones: [
        {
          href: 'nokia_3310-100.php',
          name: 'Nokia 3310',
          thumbnail: 'https://example.com/3310.jpg',
        },
      ],
      nextPageHref: null,
    });

    const { nextPageUrl } = parseBrandListingPage(html);
    expect(nextPageUrl).toBeNull();
  });

  it('returns null nextPageUrl when next href is "#"', () => {
    const html = `<!doctype html><html><body>
      <div class="makers"><ul>
        <li><a href="nokia_3310-100.php"><img src="https://example.com/3310.jpg"><strong><span>Nokia 3310</span></strong></a></li>
      </ul></div>
      <div class="review-nav-v2"><div class="nav-pages">
        <strong>1</strong>
        <a href="#" class="prevnextbuttondis">►</a>
      </div></div>
    </body></html>`;

    const { nextPageUrl } = parseBrandListingPage(html);
    expect(nextPageUrl).toBeNull();
  });

  it('returns empty list for a page with no phones', () => {
    const html = `<!doctype html><html><body>
      <div class="makers"><ul></ul></div>
    </body></html>`;

    const { phones, nextPageUrl } = parseBrandListingPage(html);
    expect(phones).toHaveLength(0);
    expect(nextPageUrl).toBeNull();
  });

  it('skips entries missing href or name', () => {
    const html = `<!doctype html><html><body>
      <div class="makers"><ul>
        <li><a href=""><img src="https://example.com/img.jpg"><strong><span>Valid Phone</span></strong></a></li>
        <li><a href="valid_phone-1.php"><img src="https://example.com/img.jpg"><strong><span>Valid Phone</span></strong></a></li>
        <li><a href="no_name-2.php"><img src="https://example.com/img.jpg"><strong><span></span></strong></a></li>
      </ul></div>
    </body></html>`;

    const { phones } = parseBrandListingPage(html);
    // Only the entry with both href and name should be included
    expect(phones).toHaveLength(1);
    expect(phones[0].name).toBe('Valid Phone');
    expect(phones[0].href).toBe('valid_phone-1.php');
  });
});
