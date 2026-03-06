import { db } from './index';
import phoneData from './phone-data.json';
import { phoneFacts, phones } from './schema';

interface PhoneEntry {
  brand: string;
  model: string;
  imagePath: string;
  releaseYear: number;
  priceTier: string;
  formFactor: string;
  region: string;
  facts?: { type: string; text: string }[];
}

async function seed() {
  console.log('Seeding phones...');

  for (const phone of phoneData as PhoneEntry[]) {
    const [inserted] = await db
      .insert(phones)
      .values({
        brand: phone.brand,
        model: phone.model,
        imagePath: phone.imagePath,
        active: true,
        releaseYear: phone.releaseYear,
        priceTier: phone.priceTier,
        formFactor: phone.formFactor,
      })
      .onConflictDoNothing()
      .returning({ id: phones.id });

    if (inserted && phone.facts) {
      for (const fact of phone.facts) {
        await db
          .insert(phoneFacts)
          .values({
            phoneId: inserted.id,
            factType: fact.type,
            factText: fact.text,
          })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`Seeded ${(phoneData as PhoneEntry[]).length} phones.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
