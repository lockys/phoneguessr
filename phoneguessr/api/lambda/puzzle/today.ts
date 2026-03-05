import { IS_MOCK } from '../../../src/mock';
import { getMockPuzzle } from '../../../src/mock/state';

export const get = async () => {
  if (IS_MOCK) {
    const p = getMockPuzzle();
    return {
      puzzleId: p.puzzleId,
      puzzleNumber: p.puzzleNumber,
      puzzleDate: p.puzzleDate,
      imageUrl: '/api/puzzle/image',
    };
  }

  const { getTodayPuzzle } = await import('../../../src/lib/puzzle');
  const { puzzle } = await getTodayPuzzle();

  return {
    puzzleId: puzzle.id,
    puzzleNumber: puzzle.puzzleNumber,
    puzzleDate: puzzle.puzzleDate,
    imageUrl: '/api/puzzle/image',
  };
};
