import path from 'node:path';
import fs from 'node:fs';
import { getTodayPuzzle } from '../../phoneguessr/src/lib/puzzle';

export async function GET() {
  const { phone } = await getTodayPuzzle();

  const imagePath = path.resolve(
    path.join(__dirname, '..', 'phoneguessr', 'config', 'public'),
    phone.imagePath.replace(/^\/public\//, ''),
  );

  if (!fs.existsSync(imagePath)) {
    return Response.json({ error: 'Image not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const base64 = buffer.toString('base64');

  return Response.json({ imageData: `data:${mime};base64,${base64}` });
}
