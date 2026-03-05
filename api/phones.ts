import { eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db';
import { phones } from '../phoneguessr/src/db/schema';

export async function GET() {
  const activePhones = await db
    .select({ id: phones.id, brand: phones.brand, model: phones.model })
    .from(phones)
    .where(eq(phones.active, true));

  return Response.json({ phones: activePhones });
}
