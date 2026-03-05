import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/phoneguessr';

export const db = drizzle(connectionString, { schema });
