# Multi-tenant production migration

## Current architecture (after this refactor)

| Layer | Responsibility |
|--------|----------------|
| **Prisma + SQLite** (or Postgres in production) | Users, organizations, memberships, modules, settings, reviews, routing rules |
| **Supabase Auth** | Email OTP / OAuth; `User.supabaseAuthId` mirrors `auth.users.id` |
| **Supabase Postgres** | Tenant dashboard facts (strategic priorities, votes, meetings, minutes, …) with RLS |
| **Bundled JSON** (`lib/mock-data/profiles/*`) | Fallback when `Organization.useSupabaseTenantData` is false |

## Where mock data lived (audit)

- `WorkspaceProvider` previously injected `getDashboardProfile(demoProfileKey)` as the only source of truth.
- Overview, voting, minutes, training, meetings, strategy, risks, and insights all read from `OrganizationProfile` in `lib/mock-data/types.ts`.
- `Organization.demoProfileKey` + `demoModeEnabled` selected which JSON bundle to show.

## What changed

1. **Workspace context** now exposes org/session only. **`useDashboardProfile()`** resolves profile data: Supabase tenant snapshot API when `useSupabaseTenantData`, else bundled JSON.
2. **Prisma `Organization`**: `isDemoTenant`, `demoEditingEnabled`, `useSupabaseTenantData`.
3. **Prisma `User`**: `supabaseAuthId`, `isPlatformAdmin`.
4. **Membership roles**: `EXECUTIVE_DIRECTOR`, `ATTORNEY_ADVISOR`, `DEMO_USER` added (stored as strings; mapped in `membershipRole.ts`).
5. **Supabase SQL**: `supabase/migrations/20260402120000_tenant_core.sql` — tenant tables + RLS (`is_member_of_org`, `can_write_tenant_org`).
6. **API**: `GET /api/organizations/[organizationId]/tenant-snapshot` (server checks Prisma membership, then service-role read).
7. **Sync**: `POST /api/auth/sync-supabase-membership` mirrors memberships into `organization_members` for `auth.uid()` RLS (called once after login from `AppAuthProvider`).
8. **Seed**: Five demo orgs; optional `SEED_SUPABASE_TENANT=1` runs `prisma/seed-supabase-tenant.ts` for Community Outreach.

## RLS model

- **Read**: any row whose `organization_id` appears in `organization_members` for `auth.uid()`.
- **Write**: same, plus role in `OWNER`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `STAFF`, `BOARD_CHAIR`, and either `is_demo = false` or `demo_editing_enabled = true`.
- **Server routes** that already enforce Prisma membership may continue using the **service role** client; RLS protects direct browser access to Supabase.

## Next steps (incremental)

1. Apply the SQL migration in the Supabase project (SQL editor or CLI).
2. Run `npx prisma db push` (or migrate) locally so new Prisma columns exist.
3. For a live customer org: set `isDemoTenant = false`, `useSupabaseTenantData = true`, seed or import rows, run sync membership after user login.
4. Replace remaining module pages that still assume static JSON with queries (or reuse `tenant-snapshot` fields).
5. Add admin UI: create org, invite user, assign role, toggle `demoEditingEnabled`, reset demo seed (re-run `seedSupabaseTenantForOrganization`).
6. Move Prisma to hosted Postgres if SQLite limits production (optional).

## Demo reset strategy

- Re-run `seedSupabaseTenantForOrganization(orgId, true)` after truncating child tables (the seed file already deletes per-table before insert for that org).
- Keep `demo_seed_version` on `tenant_organizations` for future migrations of seed shape.
