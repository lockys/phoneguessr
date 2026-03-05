import { getTodayPuzzle } from '../../phoneguessr/src/lib/puzzle';

export async function GET() {
  const { puzzle } = await getTodayPuzzle();

  return Response.json({
    puzzleId: puzzle.id,
    puzzleNumber: puzzle.puzzleNumber,
    puzzleDate: puzzle.puzzleDate,
    imageUrl: '/api/puzzle/image',
  });
}
