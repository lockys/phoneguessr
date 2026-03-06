import fs from 'node:fs';
import path from 'node:path';
import {
  getTodayPuzzle,
  getYesterdayPuzzle,
} from '../phoneguessr/src/lib/puzzle.js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'today': {
      const { puzzle } = await getTodayPuzzle();
      return Response.json({
        puzzleId: puzzle.id,
        puzzleNumber: puzzle.puzzleNumber,
        puzzleDate: puzzle.puzzleDate,
        imageUrl: '/api/puzzle/image',
      });
    }

    case 'image': {
      const { phone } = await getTodayPuzzle();
      const imagePath = path.resolve(
        process.cwd(),
        'phoneguessr',
        'config',
        'public',
        phone.imagePath.replace(/^\/public\//, ''),
      );

      if (!fs.existsSync(imagePath)) {
        return Response.json({ error: 'Image not found' }, { status: 404 });
      }

      const buffer = fs.readFileSync(imagePath);
      const ext = path.extname(imagePath).slice(1).toLowerCase();
      const mime =
        ext === 'png'
          ? 'image/png'
          : ext === 'svg'
            ? 'image/svg+xml'
            : 'image/jpeg';
      const base64 = buffer.toString('base64');
      return Response.json({ imageData: `data:${mime};base64,${base64}` });
    }

    case 'yesterday': {
      try {
        const result = await getYesterdayPuzzle();
        return Response.json(result);
      } catch {
        return Response.json({ error: 'no_yesterday_puzzle' }, { status: 404 });
      }
    }

    default:
      return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
