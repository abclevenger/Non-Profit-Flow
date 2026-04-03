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
