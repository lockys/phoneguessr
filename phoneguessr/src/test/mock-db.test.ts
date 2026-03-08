// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from './mock-db.js';

describe('createMockDb', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
  });

  describe('select chain', () => {
    it('resolves with queued array result', async () => {
      const phones = [{ id: 1, brand: 'Apple', model: 'iPhone 16' }];
      mockDb.mockQuery(phones);

      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result).toEqual(phones);
    });

    it('resolves with empty array when no result queued', async () => {
      const result = await mockDb.select().from({});
      expect(result).toEqual([]);
    });

    it('supports full chain: select().from().where().innerJoin().orderBy().limit()', async () => {
      const rows = [{ displayName: 'Alice', score: 42 }];
      mockDb.mockQuery(rows);

      const result = await mockDb
        .select({ displayName: {}, score: {} })
        .from({})
        .innerJoin({}, {})
        .where({})
        .orderBy({})
        .limit(50);

      expect(result).toEqual(rows);
    });

    it('supports groupBy and orderBy chain', async () => {
      const rows = [{ displayName: 'Bob', totalWins: 5 }];
      mockDb.mockQuery(rows);

      const result = await mockDb
        .select({ displayName: {}, totalWins: {} })
        .from({})
        .innerJoin({}, {})
        .where({})
        .groupBy({})
        .orderBy({})
        .limit(50);

      expect(result).toEqual(rows);
    });

    it('consumes results in queue order for sequential awaits', async () => {
      const first = [{ id: 1 }];
      const second = [{ id: 2 }];
      const third: never[] = [];
      mockDb.mockQuery(first, second, third);

      const r1 = await mockDb.select().from({}).where({}).limit(1);
      const r2 = await mockDb.select().from({}).where({}).limit(1);
      const r3 = await mockDb.select().from({});

      expect(r1).toEqual(first);
      expect(r2).toEqual(second);
      expect(r3).toEqual(third);
    });
  });

  describe('insert chain', () => {
    it('resolves with empty array when no returning()', async () => {
      const result = await mockDb.insert({}).values({ name: 'test' });
      expect(result).toEqual([]);
    });

    it('returning() resolves with queued inserted rows', async () => {
      const inserted = [{ id: 99, googleId: 'g123', displayName: 'Alice' }];
      mockDb.mockQuery(inserted);

      const result = await mockDb
        .insert({})
        .values({ googleId: 'g123', displayName: 'Alice' })
        .returning();

      expect(result).toEqual(inserted);
    });
  });

  describe('update chain', () => {
    it('resolves with empty array when no returning()', async () => {
      const result = await mockDb.update({}).set({ name: 'x' }).where({});
      expect(result).toEqual([]);
    });

    it('returning() resolves with queued updated rows', async () => {
      const updated = [{ id: 1, displayName: 'Bob' }];
      mockDb.mockQuery(updated);

      const result = await mockDb
        .update({})
        .set({ displayName: 'Bob' })
        .where({})
        .returning();

      expect(result).toEqual(updated);
    });
  });

  describe('vi.fn() tracking', () => {
    it('select is a vi.fn that can be asserted on', async () => {
      mockDb.mockQuery([]);
      await mockDb.select().from({});
      expect(mockDb.select).toHaveBeenCalledOnce();
    });

    it('insert is a vi.fn that can be asserted on', async () => {
      await mockDb.insert({}).values({});
      expect(mockDb.insert).toHaveBeenCalledOnce();
    });

    it('update is a vi.fn that can be asserted on', async () => {
      await mockDb.update({}).set({}).where({});
      expect(mockDb.update).toHaveBeenCalledOnce();
    });
  });

  describe('reset()', () => {
    it('clears the result queue so subsequent queries return empty array', async () => {
      mockDb.mockQuery([{ id: 1 }]);
      mockDb.reset();

      const result = await mockDb.select().from({});
      expect(result).toEqual([]);
    });

    it('does not affect already-consumed results', async () => {
      mockDb.mockQuery([{ id: 1 }]);
      const r1 = await mockDb.select().from({});
      mockDb.reset();
      const r2 = await mockDb.select().from({});

      expect(r1).toEqual([{ id: 1 }]);
      expect(r2).toEqual([]);
    });
  });

  describe('mixed operations', () => {
    it('select and insert share the same queue in call order', async () => {
      const selectResult = [{ id: 1 }];
      const insertResult = [{ id: 2 }];
      mockDb.mockQuery(selectResult, insertResult);

      const r1 = await mockDb.select().from({}).where({}).limit(1);
      const r2 = await mockDb.insert({}).values({}).returning();

      expect(r1).toEqual(selectResult);
      expect(r2).toEqual(insertResult);
    });
  });
});
