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

1. Apply SQL migrations in Supabase in order: `20260402120000_tenant_core.sql`, then `20260403130000_platform_admin_rls.sql` (adds `is_platform_admin()` and broadens SELECT / `can_write_tenant_org` for operators in `platform_admins`).
2. Run `npx prisma generate` and `npx prisma db push` (or `migrate`) so Prisma matches schema — resolve any local DB drift first.
3. For a **live** customer org: set `isDemoTenant = false`, `useSupabaseTenantData = true`, seed or import Supabase rows, run `POST /api/auth/sync-supabase-membership` after login.
4. **Seeded demo orgs (all five):** set `SEED_SUPABASE_TENANT=1` and `SUPABASE_SERVICE_ROLE_KEY` when running `npx prisma db seed` — each demo org gets tenant rows from its `demoProfileKey` profile (`seedSupabaseTenantForDemoOrg` in `src/lib/tenant/seedSupabaseTenantData.ts`).
5. **Platform admin:** `/platform-admin` — reset any `isDemoTenant` org to its template via `POST /api/platform-admin/demo-tenants/[organizationId]/reset` (server checks `User.isPlatformAdmin`). Insert matching `auth.users.id` into `public.platform_admins` if operators should bypass RLS from the Supabase client.
6. **Org settings (Prisma):** `OrganizationSettings.extendedSettings` (JSON string on SQLite) holds operational prefs — UI at `/settings/workspace`; API `GET/PATCH /api/organizations/[organizationId]/workspace-settings`.
7. **Members (read-only list):** `/settings/members` for org admins; API `GET /api/organizations/[organizationId]/members`.
8. **Demo membership guard:** use `assertUserMayJoinDemoOrganization` before assigning memberships to demo tenants unless `User.allowDemoOrganizationAssignment` or platform admin (see `src/lib/organizations/demoMembershipPolicy.ts`).
9. Replace remaining module pages that still assume static JSON with tenant queries where `useSupabaseTenantData` is on.
10. Move Prisma to hosted Postgres for production if SQLite limits you; keep `extendedSettings` as a text/JSON column.

## Demo reset strategy

- **App:** Platform admin calls `POST /api/platform-admin/demo-tenants/[id]/reset` (uses `seedSupabaseTenantForDemoOrg`, preserves Prisma `demoEditingEnabled` on `tenant_organizations`).
- **CLI:** Re-run `npx prisma db seed` with `SEED_SUPABASE_TENANT=1` to rehydrate all demo tenants.
- Keep `demo_seed_version` on `tenant_organizations` for future migrations of seed shape.

## Mock data audit (where UI is still driven by bundles)

| Source | When used |
|--------|-----------|
| `useDashboardProfile` | `useSupabaseTenantData === false` → `getDashboardProfile(demoProfileKey)` |
| `lib/mock-data/profiles/*` | Templates for Prisma seed + Supabase tenant seed |
| Module pages under `(dashboard)/*` | Consume `useDashboardProfile().profile` — switch org to a Supabase-backed demo org to exercise live queries |

**Goal:** set `useSupabaseTenantData` for production orgs and demos that should feel “real”; keep mock fallback for orgs not yet migrated.
