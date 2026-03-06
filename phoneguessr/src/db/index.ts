import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

function getConnectionString() {
  const url = process.env.DATABASE_URL || 'postgresql://localhost:5432/phoneguessr';
  if (url.includes('sslmode=require') && !url.includes('uselibpqcompat')) {
    return url.replace('sslmode=require', 'sslmode=verify-full');
  }
  return url;
}

export const db = drizzle(getConnectionString(), { schema });
