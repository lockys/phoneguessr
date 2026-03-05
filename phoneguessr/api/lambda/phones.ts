import { IS_MOCK } from '../../src/mock';
import { MOCK_PHONES } from '../../src/mock/data';

export const get = async () => {
  if (IS_MOCK) {
    return {
      phones: MOCK_PHONES.map(p => ({ id: p.id, brand: p.brand, model: p.model })),
    };
  }

  const { eq } = await import('drizzle-orm');
  const { db } = await import('../../src/db');
  const { phones } = await import('../../src/db/schema');

  const activePhones = await db
    .select({ id: phones.id, brand: phones.brand, model: phones.model })
    .from(phones)
    .where(eq(phones.active, true));

  return { phones: activePhones };
};
