import { IS_MOCK } from '../../../src/mock/index.ts';
import { getMockYesterdayPuzzle } from '../../../src/mock/state.ts';

export const get = async () => {
  if (IS_MOCK) {
    return getMockYesterdayPuzzle();
  }

  const { getYesterdayPuzzle } = await import('../../../src/lib/puzzle');

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
};
