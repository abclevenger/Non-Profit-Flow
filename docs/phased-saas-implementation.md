# Phased SaaS implementation (multi-tenant board platform)

This document breaks work into three phases: **foundation**, **settings & demo governance**, and **domain modules**. It is aligned with the current Next.js + Prisma + Supabase codebase.

**Legend:** ✅ already present in repo · 🔄 partial · ⬜ not started

---

## Phase 1 — Tenants, members, profiles, roles, active org, dashboard by `organization_id`

### Goals

- Every authenticated request can resolve **active organization** and **membership role**.
- Dashboard/overview data is **scoped by `organization_id`** (Prisma for org graph; Supabase tenant tables for board facts when `useSupabaseTenantData` is true).

### Schema changes

| Layer | Table / model | Status | Notes |
|--------|----------------|--------|--------|
| **Prisma** | `Organization` | ✅ | `id`, `slug`, branding, `isDemoTenant`, `useSupabaseTenantData`, `demoProfileKey`, … |
| **Prisma** | `OrganizationMembership` | ✅ | `organizationId`, `userId`, `role` (string enum set in app) |
| **Prisma** | `User` | ✅ | `email`, `supabaseAuthId`, `isPlatformAdmin`, `allowDemoOrganizationAssignment`, legacy `role` |
| **Prisma** | `UserProfile` (dedicated) | ⬜ | Optional: add `UserProfile` with `userId` @unique, `title`, `phone`, `avatarUrl`, `timezone`, `preferences` JSON — keeps `User` lean for auth |
| **Supabase** | `tenant_organizations` | ✅ | Mirrors Prisma `Organization.id`; `is_demo`, `demo_editing_enabled` |
| **Supabase** | `organization_members` | ✅ | `organization_id`, `user_id` (auth.users), `role` — synced from Prisma for RLS |

**Recommended Phase 1 addition (if you want explicit `user_profiles`):**

```prisma
// prisma/schema.prisma (additive)
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobTitle  String?
  phone     String?
  timezone  String?  @default("America/New_York")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Add `userProfile UserProfile?` on `User`. Run `prisma migrate` / `db push`.

### Files to update (Phase 1)

| Area | Files |
|------|--------|
| Session / active org | `src/lib/auth/get-app-auth.ts`, `src/lib/auth/sessionOrganizations.ts`, `src/lib/auth/active-org-cookie.ts`, `src/app/api/auth/active-organization/route.ts` |
| Client context | `src/lib/workspace-context.tsx`, `src/components/dashboard/OrganizationSwitcher.tsx` |
| Dashboard data | `src/lib/workspace/useDashboardProfile.tsx`, `src/app/api/organizations/[organizationId]/tenant-snapshot/route.ts`, `src/lib/tenant/fetchTenantSnapshot.ts`, `src/lib/tenant/mapSnapshotToProfile.ts` |
| Roles | `src/lib/organizations/membershipRole.ts`, `src/lib/auth/roles.ts`, `src/lib/auth/permissions.ts` |
| Org access guard | `src/lib/organizations/orgAccess.ts` |
| Membership sync | `src/app/api/auth/sync-supabase-membership/route.ts` |

### Code (patterns to enforce)

**1. Server: always scope by org after membership check**

```ts
// Any route handler
const session = await auth();
const access = await assertOrgAccess(session, organizationId);
if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
```

**2. Client: read active org from workspace, never hardcode org id**

```tsx
const { organizationId, organization, setActiveOrganization } = useWorkspace();
// Pass organizationId into fetches: `/api/organizations/${organizationId}/...`
```

**3. Dashboard profile source**

- `organization.useSupabaseTenantData && organizationId` → fetch tenant snapshot (already in `useDashboardProfile`).
- Else → `getDashboardProfile(demoProfileKey)` mock bundle.

### Migration notes (Phase 1)

1. **Prisma:** Apply schema; ensure every `User` that signs in has at least one `OrganizationMembership` for non-empty dashboard (seed or onboarding).
2. **Supabase:** Apply `supabase/migrations/20260402120000_tenant_core.sql`; run `sync-supabase-membership` after login (already triggered from `AppAuthProvider` pattern).
3. **Cutover:** For each production org, set `useSupabaseTenantData = true` and seed `tenant_*` rows (or import); until then mock fallback remains safe.

### Testing checklist (Phase 1)

- [ ] Sign in; session includes `organizations[]` and `activeOrganization` when memberships exist.
- [ ] Organization switcher updates cookie + session; dashboard refetches for new org.
- [ ] `GET /api/organizations/:id/tenant-snapshot` returns 403 for non-member, 200 for member.
- [ ] With `useSupabaseTenantData: false`, overview shows mock profile for `demoProfileKey`.
- [ ] With `useSupabaseTenantData: true` and seeded tenant, overview shows DB-backed profile.
- [ ] RLS: as member A, cannot read org B’s rows via Supabase client (spot-check in SQL or client).

---

## Phase 2 — Settings, admin user management, demo orgs, badges, read-only

### Goals

- **Settings** persisted per organization (Prisma + optional Supabase metadata).
- **Admin** can list members, invite users, assign roles (server-enforced).
- **Demo orgs** seeded and clearly labeled; **read-only** unless `demoEditingEnabled` or platform admin (RLS + app guards).

### Schema changes

| Layer | Change | Status |
|--------|--------|--------|
| **Prisma** | `OrganizationSettings.extendedSettings` (JSON string on SQLite) | ✅ |
| **Prisma** | `User.allowDemoOrganizationAssignment` | ✅ |
| **Prisma** | `Organization.invite` / `OrganizationInvite` token table | ⬜ Optional: `OrganizationInvite { id, organizationId, email, role, tokenHash, expiresAt, createdByUserId }` |
| **Supabase** | `can_write_tenant_org` + demo flags | ✅ base migration |
| **Supabase** | `is_platform_admin()` + broadened policies | ✅ `20260403130000_platform_admin_rls.sql` |
| **Supabase** | `platform_admins` rows | 🔄 Manual / future sync job |

**Optional invite table (recommended for Phase 2):**

```prisma
model OrganizationInvite {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email          String
  role           String
  tokenHash      String
  expiresAt      DateTime
  createdByUserId String?
  createdAt      DateTime @default(now())
  @@index([organizationId, email])
}
```

### Files to update (Phase 2)

| Area | Files |
|------|--------|
| Settings UI | `src/components/organization-settings/OrganizationSettingsView.tsx`, `src/components/organization-settings/WorkspaceOperationalSettingsClient.tsx`, `src/app/(dashboard)/settings/workspace/page.tsx` |
| Settings API | `src/app/api/organizations/[organizationId]/workspace-settings/route.ts` |
| Members (read) | `src/app/(dashboard)/settings/members/page.tsx`, `src/app/api/organizations/[organizationId]/members/route.ts` |
| Demo guard | `src/lib/organizations/demoMembershipPolicy.ts` — call from new invite/assign APIs |
| Demo reset | `src/app/api/platform-admin/demo-tenants/[organizationId]/reset/route.ts`, `src/lib/tenant/seedSupabaseTenantData.ts`, `prisma/seed.ts` |
| Badges | `src/components/dashboard/DashboardHeader.tsx`, `src/components/dashboard/DashboardShell.tsx`, `OrganizationSwitcher` (demo suffix) |
| Read-only UI | Add `useDemoReadOnly()` hook: `organization?.isDemoTenant && !organization?.demoEditingEnabled && !isPlatformAdmin` — disable forms / show banner in editors |
| Seed | `prisma/seed.ts`, `SEED_SUPABASE_TENANT=1` path |

**New files (Phase 2 — admin user management)**

- `src/app/api/organizations/[organizationId]/invites/route.ts` — POST create invite (org admin); GET list pending.
- `src/app/api/organizations/[organizationId]/members/[membershipId]/route.ts` — PATCH role, DELETE membership.
- `src/app/(dashboard)/settings/members/MembersManagementClient.tsx` — wire buttons to APIs (or extend server page with forms).

### Code (sketches)

**Demo read-only guard (client)**

```tsx
// src/lib/organizations/useDemoReadOnly.ts
"use client";
import { useWorkspace } from "@/lib/workspace-context";
import { useSession } from "@/lib/auth/session-hooks";

export function useDemoReadOnly() {
  const { organization } = useWorkspace();
  const { data: session } = useSession();
  const demo = Boolean(organization?.isDemoTenant);
  const canEdit = Boolean(organization?.demoEditingEnabled) || Boolean(session?.user?.isPlatformAdmin);
  return { isDemoReadOnly: demo && !canEdit, isDemo: demo };
}
```

**Invite create (server)**

```ts
// Pseudocode: POST /api/organizations/[id]/invites
// 1. assertOrgAccess + canManageOrganizationSettings (or OWNER/ADMIN membership role)
// 2. If org.isDemoTenant, await assertUserMayJoinDemoOrganization(targetUserId) when linking existing user
// 3. Create invite row; send email with magic link to /auth/accept-invite?token=
```

### Migration notes (Phase 2)

1. Backfill `OrganizationSettings.extendedSettings` with `JSON.stringify(defaultExtendedSettings())` for orgs missing it (one-off script or seed).
2. Insert `platform_admins` in Supabase for operator UUIDs equal to `auth.users.id`.
3. Train sales: demo orgs use `isDemoTenant: true`; live pilots use `false` and real data only.

### Testing checklist (Phase 2)

- [ ] `/settings/workspace` loads and PATCH persists; reload confirms values.
- [ ] `/settings/members` lists only active org’s memberships.
- [ ] Demo org shows badges in header and switcher label.
- [ ] With `demoEditingEnabled: false`, Supabase writes from anon key fail RLS for BOARD_MEMBER (manual test).
- [ ] Platform admin reset: `POST .../reset` re-seeds only `isDemoTenant` orgs; live org rejected with 400.
- [ ] Assigning user without `allowDemoOrganizationAssignment` to demo org fails once invite API checks `demoMembershipPolicy` (after implementation).

---

## Phase 3 — Meetings, voting, minutes, compliance, insights, reports

### Goals

- Move from **JSON payload blobs** in `tenant_board_meetings`, `tenant_vote_items`, `tenant_meeting_minutes` to **normalized rows** where editing, reporting, and RLS per row matter — *or* keep JSON but add **versioning**, **APIs**, and **UI guards** (incremental).

### Schema changes (recommended evolution)

**Option A — incremental (keep JSON, add metadata columns)**

```sql
-- Example: supabase/migrations/YYYYMMDD_meeting_meta.sql
ALTER TABLE public.tenant_board_meetings
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id),
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
-- Repeat pattern for votes/minutes
```

**Option B — normalized (longer migration)**

| Table | Key columns |
|-------|-------------|
| `meetings` | `id`, `organization_id`, `title`, `starts_at`, `location`, `status`, `created_by`, timestamps |
| `meeting_agenda_items` | `id`, `meeting_id`, `sort_order`, `kind`, `title`, `body`, `linked_vote_id` |
| `votes` / `vote_items` | ballot metadata + options + tallies |
| `meeting_minutes` | `meeting_id`, `status`, `body` or structured sections |
| `compliance_items` | Already close to `tenant_compliance_events` — extend with `severity`, `owner_user_id`, `due_at` |
| `board_insights` | Already `tenant_board_insights` — add `source`, `expires_at` |
| `documents` | `tenant_document_items` + storage path / `storage_object_id` |

All tables: `organization_id`, `created_at`, `updated_at`, `created_by` where applicable. RLS: same `is_member_of_org` / `can_write_tenant_org` patterns.

**Prisma:** If modules need server-side reporting outside Supabase, mirror summary tables or use Prisma only for “workflow state” and Supabase for board facts — avoid two sources of truth without sync rules.

### Files to update (Phase 3)

| Module | Typical files |
|--------|----------------|
| Meetings | `src/app/(dashboard)/meetings/**/*.tsx`, `src/components/meeting-workflow/**`, new `src/app/api/organizations/[organizationId]/meetings/**` |
| Voting | `src/app/(dashboard)/voting/**/*.tsx`, `src/components/voting/**`, APIs for ballots |
| Minutes | `src/components/minutes/**`, `src/app/(dashboard)/minutes/**` |
| Compliance | Overview/governance pages reading `tenant_compliance_events` or new table |
| Insights | `src/lib/insights/**`, map from `tenant_board_insights` + computed governance |
| Reports | `src/app/(dashboard)/assessment/**`, NP assessment APIs — scope `organizationId` on all queries |

**Shared**

- `src/lib/tenant/fetchTenantSnapshot.ts` — extend shape or split per-domain fetchers.
- `src/lib/tenant/mapSnapshotToProfile.ts` — thin as tables normalize; prefer mappers per domain.

### Code (direction)

1. **Single org id** passed into every server loader and mutation.
2. **Mutations** use Supabase server client with user JWT (RLS) *or* service role only after `assertOrgAccess` + `can_write_tenant_org` equivalent in code.
3. **Reports** aggregate in SQL or server route; cache with `organization_id` tag.

### Migration notes (Phase 3)

1. **Dual-read period:** UI reads normalized tables if non-empty, else falls back to JSON payload (same pattern as `mapSnapshotToOrganizationProfile` + `fallback`).
2. **Backfill script:** Node script or SQL to explode existing `payload` JSON into rows per org.
3. **Freeze demo templates:** bump `demo_seed_version` when seed shape changes.

### Testing checklist (Phase 3)

- [ ] Create/edit meeting as org admin; member sees update; non-member cannot.
- [ ] Vote lifecycle states consistent with minutes linkage.
- [ ] Minutes approval workflow respects role (chair vs member) if enforced.
- [ ] Compliance list filtered by `organization_id` only.
- [ ] Insights reflect tenant rows + no cross-tenant leakage in API responses.
- [ ] Assessment/report exports include only active org’s data.

---

## Suggested order of execution

1. **Phase 1:** Confirm `UserProfile` need → add if required; document onboarding for first membership.
2. **Phase 2:** Invites + membership PATCH/DELETE; `useDemoReadOnly` across editable surfaces; optional `OrganizationInvite` table.
3. **Phase 3:** Pick Option A or B per module; ship meetings first (highest coupling to votes/minutes).

---

## Quick reference — existing migration files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260402120000_tenant_core.sql` | Tenant tables + base RLS |
| `supabase/migrations/20260403130000_platform_admin_rls.sql` | Platform admin read/write bypass |

---

## Quick reference — env / seed

| Variable | Effect |
|----------|--------|
| `SEED_SUPABASE_TENANT=1` | Seed all demo orgs into Supabase + `useSupabaseTenantData` in `prisma/seed.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for seed + tenant snapshot service path |
