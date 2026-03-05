import { db } from './index';
import { phones } from './schema';
import phoneData from './phone-data.json';

async function seed() {
  console.log('Seeding phones...');

  for (const phone of phoneData) {
    await db
      .insert(phones)
      .values({
        brand: phone.brand,
        model: phone.model,
        imagePath: phone.imagePath,
        active: true,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${phoneData.length} phones.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
