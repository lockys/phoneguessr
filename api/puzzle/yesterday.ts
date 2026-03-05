import { getYesterdayPuzzle } from '../../phoneguessr/src/lib/puzzle';

export async function GET() {
  const data = await getYesterdayPuzzle();

  if (!data) {
    return Response.json(
      { error: 'No puzzle found for yesterday' },
      { status: 404 },
    );
  }

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
