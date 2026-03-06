import { getYesterdayPuzzle } from '../../phoneguessr/src/lib/puzzle';

export async function GET() {
  try {
    const result = await getYesterdayPuzzle();
    return Response.json(result);
  } catch {
    return Response.json({ error: 'no_yesterday_puzzle' }, { status: 404 });
  }
}
