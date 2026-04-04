<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:engineering-standards -->
# Engineering standards (Non-Profit Flow)

## Frontend

- Use **React** and the **Next.js App Router** (see `package.json` for the exact major
  version; follow 14+ idioms: Server Components by default, `"use client"` only when needed).
- Prioritize **accessibility**: keyboard navigation, visible focus, semantic HTML, and ARIA
  only when native elements are insufficient—nonprofits serve diverse users.

## Backend

- Prefer **Supabase** (auth, Postgres/RLS) and **Next.js Route Handlers** under
  `src/app/api/**` plus shared logic in `src/lib/**`. This repo does not use Express unless
  we add it explicitly.

## Structure

- Keep code **modular by feature**: e.g. `(dashboard)/assessment` with `src/lib/np-assessment`,
  dashboard shell under `src/components/dashboard`, etc.—one domain per folder tree.

## Configuration and secrets

- **Never hardcode secrets.** Use `.env` / `.env.local` and `process.env` (or
  `NEXT_PUBLIC_*` only for client-safe values). Document keys in `.env.example`.

## AI-assisted code

- For blocks that are mainly model-generated, add a short comment, e.g.
  `// AI prompt: "Generate feedback for low quorum score"` (adjust the quoted text to match
  the actual prompt).

## Style

- Aim for **readable lines** (~80 characters where practical); stay **ESLint-clean**
  (`npm run lint`, `eslint-config-next`).
<!-- END:engineering-standards -->

## Cursor Cloud specific instructions

### Services overview

| Service | How to run | Notes |
|---------|-----------|-------|
| **Next.js dev server** | `npm run dev` (port 3000) | Main app; requires Supabase for auth |
| **Supabase (local)** | `npx supabase start` | Requires Docker; provides auth, Mailpit for OTP emails |
| **SQLite (Prisma)** | `npx prisma db push && npx prisma db seed` | File-based `dev.db`; no separate process |

### Starting the dev environment

1. Docker must be running (`sudo dockerd` if needed).
2. Start local Supabase: `npx supabase start` (takes ~60s first time; pulls images).
3. Get the JWT-format keys: `npx supabase status -o env` → use `ANON_KEY` and `SERVICE_ROLE_KEY` (not the `sb_publishable_*` / `sb_secret_*` format).
4. Ensure `.env` has:
   - `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from step 3>`
   - `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from step 3>`
   - `AUTH_SECRET=<any random string>`
   - `DATABASE_URL="file:./dev.db"`
5. Push schema and seed: `npx prisma db push && npx prisma db seed`
6. Start dev server: `npm run dev`

### Auth flow (OTP via local Supabase)

- Login uses Supabase OTP (not passwords). Enter email → retrieve the 6-digit code from Mailpit at `http://127.0.0.1:54324`.
- Seeded users: `admin@board.demo`, `member@board.demo`, `guest@board.demo` (see seed output for details).
- The `supabase/config.toml` sets `site_url = "http://localhost:3000"` and increased email rate limit for local dev.

### Standard commands

See `README.md` and `package.json` scripts. Key commands:
- `npm run lint` — ESLint (has pre-existing warnings/errors; not blocking)
- `npm run build` — production build
- `npm run dev` — development server
- `npm run db:push` / `npm run db:seed` — Prisma schema push and seed

### Gotchas

- **Next.js 16 renames `middleware.ts` → `proxy.ts`**: the auth middleware is at `src/proxy.ts`, exporting `proxy` (not `middleware`). See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- **Most dashboard pages use mock data** (`src/lib/mock-data/`), so they render without external services beyond Supabase auth.
- **Supabase CLI v2.84+ shows `sb_publishable_*` keys** by default; the app needs the JWT-format `ANON_KEY` from `npx supabase status -o env`.
