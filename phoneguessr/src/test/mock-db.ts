import { vi } from 'vitest';

/**
 * Creates a chainable query builder that resolves to a queued result when awaited.
 * All chain methods return the same chain so calls can be fluently chained.
 * Consuming from the shared result queue happens on `await` (i.e. in `then`).
 */
// biome-ignore lint/suspicious/noExplicitAny: test utility, any is intentional
function makeChain(queue: unknown[]): any {
  // biome-ignore lint/suspicious/noExplicitAny: test utility, any is intentional
  const chain: any = {
    from: () => chain,
    where: () => chain,
    innerJoin: () => chain,
    leftJoin: () => chain,
    orderBy: () => chain,
    groupBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    // insert/update chain methods
    values: () => chain,
    set: () => chain,
    returning: () => chain,
    // biome-ignore lint/suspicious/noThenProperty: intentional thenable for test mock
    then(
      onFulfilled?: ((value: unknown) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null,
    ) {
      const result = queue.shift() ?? [];
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };
  return chain;
}

/**
 * Factory that creates a lightweight mock of the drizzle `db` object.
 *
 * Usage in tests:
 * ```ts
 * const mockDb = createMockDb();
 * vi.mock('../db/index.js', () => ({ db: mockDb }));
 *
 * beforeEach(() => {
 *   vi.clearAllMocks();
 *   mockDb.reset();
 * });
 *
 * it('returns phones', async () => {
 *   mockDb.mockQuery([{ id: 1, brand: 'Apple', model: 'iPhone 16' }]);
 *   const res = await GET(new Request('http://localhost/api/phones'));
 *   // ...
 * });
 * ```
 *
 * Results are consumed in the order they are enqueued, matching the sequential
 * order in which the handler awaits each DB query.
 */
export function createMockDb() {
  const queue: unknown[] = [];

  const db = {
    select: vi.fn((..._args: unknown[]) => makeChain(queue)),
    insert: vi.fn((..._args: unknown[]) => makeChain(queue)),
    update: vi.fn((..._args: unknown[]) => makeChain(queue)),

    /**
     * Enqueue one or more results for upcoming awaited db queries, in call order.
     * Each result is consumed by exactly one `await db.select/insert/update(...)` chain.
     */
    mockQuery(...results: unknown[]) {
      queue.push(...results);
    },

    /**
     * Clear the result queue. Call in `beforeEach` to reset between tests.
     */
    reset() {
      queue.length = 0;
    },
  };

  return db;
}

export type MockDb = ReturnType<typeof createMockDb>;
