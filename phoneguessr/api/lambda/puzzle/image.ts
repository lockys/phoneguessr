import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';
import { getMockImageData } from '../../../src/mock/state.ts';

export const get = async () => {
  if (IS_MOCK) {
    const imageData = getMockImageData();
    if (!imageData) {
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }
    return Response.json({ imageData });
  }

  const c = useHonoContext();

  const { getTodayPuzzle } = await import('../../../src/lib/puzzle');
  const { phone } = await getTodayPuzzle();
  const path = await import('node:path');
  const fs = await import('node:fs');

  const imagePath = path.resolve('config/public', phone.imagePath.replace(/^\/public\//, ''));

  if (!fs.existsSync(imagePath)) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const base64 = buffer.toString('base64');

  return c.json({ imageData: `data:${mime};base64,${base64}` });
};
