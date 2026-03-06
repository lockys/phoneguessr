## 1. Driver Swap

- [x] 1.1 Add `@neondatabase/serverless` to root `package.json` dependencies
- [x] 1.2 Rewrite `phoneguessr/src/db/index.ts` to use `drizzle-orm/neon-http` with `neon()` from `@neondatabase/serverless`
- [x] 1.3 Remove the `getConnectionString()` SSL workaround — Neon HTTP doesn't need it

## 2. Verify API Functions

- [x] 2.1 Install root dependencies (`npm install` at repo root)
- [x] 2.2 Test `/api/phones` endpoint locally against Neon (using `.env.local`)
- [x] 2.3 Test `/api/puzzle/today` endpoint to confirm puzzle creation/retrieval works
- [x] 2.4 Verify mock mode still works (`npm run dev:mock` in phoneguessr/)

## 3. Deploy and Validate

- [x] 3.1 Commit and push changes
- [ ] 3.2 Verify Vercel deployment succeeds without ESM or driver errors
