import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { db } from './index';
import { phones } from './schema';

interface ManifestEntry {
  brand: string;
  model: string;
  imageUrl?: string;
  source?: string;
  releaseYear?: number;
  priceTier?: string;
  formFactor?: string;
  difficulty?: string;
}

async function seed() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const manifestPath = path.resolve(
    __dirname,
    '../../scripts/press-kit-manifest.json',
  );
  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(manifestPath, 'utf-8'),
  );

  const entries = manifest.filter(
    e => e.source === 'wikimedia-commons' && e.imageUrl,
  );

  console.log(`Seeding ${entries.length} phones from Wikimedia manifest...`);

  for (const entry of entries) {
    await db
      .insert(phones)
      .values({
        brand: entry.brand,
        model: entry.model,
        imageUrl: entry.imageUrl as string,
        active: true,
        releaseYear: entry.releaseYear ?? null,
        priceTier: entry.priceTier ?? null,
        formFactor: entry.formFactor ?? null,
        difficulty: entry.difficulty ?? null,
      })
      .onConflictDoUpdate({
        target: [phones.brand, phones.model],
        set: { imageUrl: sql`excluded.image_url` },
      });
  }

  console.log(`Seeded ${entries.length} phones.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
