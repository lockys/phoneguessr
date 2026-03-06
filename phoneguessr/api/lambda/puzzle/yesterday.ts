import { IS_MOCK } from '../../../src/mock/index.ts';
import {
  getMockYesterdayImageData,
  getMockYesterdayPuzzle,
} from '../../../src/mock/state.ts';

export const get = async () => {
  if (IS_MOCK) {
    const data = getMockYesterdayPuzzle();
    const imageData = getMockYesterdayImageData();
    return {
      ...data,
      imageData,
    };
  }

  // Production: delegate to puzzle lib
  const { getYesterdayPuzzle } = await import('../../../src/lib/puzzle');
  const result = await getYesterdayPuzzle();
  if (!result) {
    return Response.json({ error: 'no_yesterday_puzzle' }, { status: 404 });
  }
  return result;
};
