# SaaS transformation: audit, schema, and phased delivery

This document is the working blueprint for moving from **demo-driven UI** to **real multi-tenant software**. It complements [`multi-tenant-migration.md`](./multi-tenant-migration.md) (current split: Prisma org graph + Supabase tenant facts + mock fallback).

---

## 1. Audit: demo-driven areas (current)

### 1.1 Dashboard profile source (single choke point)

| Location | Behavior |
|----------|----------|
| [`src/lib/workspace/useDashboardProfile.tsx`](../src/lib/workspace/useDashboardProfile.tsx) | If `Organization.useSupabaseTenantData` is false, loads **`getDashboardProfile(demoProfileKey)`** from [`lib/mock-data/dashboardData.ts`](../src/lib/mock-data/dashboardData.ts). If true, fetches **`/api/organizations/[id]/tenant-snapshot`** (Supabase snapshot → `OrganizationProfile`). |
| [`src/lib/tenant/mapSnapshotToProfile.ts`](../src/lib/tenant/mapSnapshotToProfile.ts) | When tenant tables are sparse, **falls back to bundled JSON** slices via `getDashboardProfile`. |

**Impact:** Overview, strategy widgets, risks, documents, training, minutes, votes, meetings, and “this week” models all consume **`OrganizationProfile`**—either **mock bundle** or **hydrated snapshot**. Until every org has `useSupabaseTenantData` and non-empty normalized rows, the UI remains partly illustrative.

### 1.2 Pages / components still tied to `useDemoMode()` / profile bundles

| Area | Files (representative) |
|------|-------------------------|
| **Overview** | [`src/app/(dashboard)/overview/page.tsx`](../src/app/(dashboard)/overview/page.tsx) — `useDemoMode()`, `buildFocusHeroCards(profile)`, etc. |
| **Meetings** | [`src/app/(dashboard)/meetings/[id]/page.tsx`](../src/app/(dashboard)/meetings/[id]/page.tsx) |
| **Reviews / GC** | [`general-counsel/page.tsx`](../src/app/(dashboard)/general-counsel/page.tsx), [`reviews/page.tsx`](../src/app/(dashboard)/reviews/page.tsx) |
| **Settings / branding** | [`OrganizationSettingsView.tsx`](../src/components/organization-settings/OrganizationSettingsView.tsx), [`organization-branding-context.tsx`](../src/lib/organization-branding-context.tsx), [`colors.ts`](../src/lib/organization-settings/colors.ts) |
| **Sidebar** | [`DashboardSidebar.tsx`](../src/components/dashboard/DashboardSidebar.tsx) — types from `mock-data` |
| **Platform admin** | [`platform-admin/`](../src/app/(dashboard)/platform-admin/) — demo reset uses **profile templates** in [`seedSupabaseTenantData.ts`](../src/lib/tenant/seedSupabaseTenantData.ts) |

### 1.3 Assessment (partially real today)

| Layer | Status |
|-------|--------|
| Prisma | `NpAssessment`, `NpAssessmentCategory`, `NpAssessmentQuestion`, `NpAssessmentResponse`, `NpAssessmentReport`, `NpAssessmentParticipant` — **real persistence** (SQLite/Postgres via Prisma). |
| Answers | `MET`, `NEEDS_WORK`, `NA`, `DONT_KNOW` + `flaggedForConsult` — aligned with product. |
| Gaps | Ensure **all** UI paths use org-scoped APIs only; report generation strictly from stored responses; consult rules only from flags (no hardcoded “demo” scores). |

### 1.4 Authoritative org / membership (already largely real)

- **Prisma:** `Organization`, `OrganizationMembership`, `OrganizationSettings`, `OrganizationModule`.
- **Session:** [`sessionOrganizations.ts`](../src/lib/auth/sessionOrganizations.ts), active org cookie, organization switcher.
- **API guard:** [`orgAccess.ts`](../src/lib/organizations/orgAccess.ts) — `assertOrgAccess` + Prisma membership.

---

## 2. Proposed schema changes (target)

### 2.1 Prisma (application database)

**Done in Phase 1 (this PR):**

- `UserProfile` — 1:1 with `User` (preferences + display fields not on auth user).

**Later phases:**

- **Phase 3–4:** Prefer **normalized** Prisma models for meetings, agendas, votes, action items, compliance, documents—**or** keep JSON payloads in Supabase tenant tables but **stop** using static TS bundles for production orgs.
- **Phase 5:** Invites table, notification prefs, org archive flags, audit log pointers.

### 2.2 Supabase Postgres (tenant + auth-aligned)

**Existing:** `tenant_organizations`, `organization_members`, `tenant_*` fact tables (see `supabase/migrations/20260402120000_tenant_core.sql`).

**Phase 1 (this PR):** `user_profiles` — mirrors app user preferences for clients using Supabase JWT directly.

**Phase 2 (assessment on Supabase — optional dual-write):** If assessments must be RLS-protected in Supabase:

| Table | Purpose |
|-------|---------|
| `assessments` | Org-scoped run; status `draft` / `in_progress` / `completed`; submitted_at. |
| `assessment_categories` | Or reference global catalog by id/slug. |
| `assessment_questions` | Or sync from catalog. |
| `assessment_responses` | Participant + question + answer + notes + flagged. |
| `assessment_reports` | Cached JSON / PDF ref. |

**Recommendation:** Keep **Prisma** as source of truth for assessments until you need browser-direct Postgres; then migrate with a **one-time backfill** and dual-write window.

---

## 3. RLS policy approach

**Current model (tenant facts):**

- `is_member_of_org(org_id)` — `organization_members.user_id = auth.uid()`.
- `can_write_tenant_org(org_id)` — role in write set **and** (`is_demo = false` OR `demo_editing_enabled`).

**Phase 1 adjustment:** Include **`ATTORNEY_ADVISOR`** in the write allowlist where advisory staff should edit tenant content (see new migration). Tighten per-table if attorneys should be read-only on votes only.

**Platform ops:** `platform_admins` + `is_platform_admin()` (existing migration) for break-glass.

**User profiles:** User may `SELECT`/`UPDATE` only their own row (`user_id = auth.uid()`).

---

## 4. Canonical roles (product ↔ storage)

| Product role | Prisma `OrganizationMembership.role` | Notes |
|--------------|----------------------------------------|--------|
| `platform_admin` | N/A (use `User.isPlatformAdmin` + `platform_admins`) | Cross-tenant. |
| `organization_admin` | `OWNER`, `ADMIN` (alias **`ORGANIZATION_ADMIN`** accepted in coerce) | Settings, members, billing (future). |
| `board_chair` | `BOARD_CHAIR` | |
| `board_member` | `BOARD_MEMBER` | |
| `executive_director` | `EXECUTIVE_DIRECTOR` | |
| `staff_member` | `STAFF` (alias **`STAFF_MEMBER`**) | |
| `attorney_advisor` | `ATTORNEY_ADVISOR` | Maps to permission layer as `GENERAL_COUNSEL`. |

Implemented in [`src/lib/saas/roles.ts`](../src/lib/saas/roles.ts) and [`src/lib/organizations/membershipRole.ts`](../src/lib/organizations/membershipRole.ts).

---

## 5. Files to create / update (rolling checklist)

### Phase 1 (foundation)

| Action | Path |
|--------|------|
| Add | `docs/saas-transformation-master-plan.md` (this file) |
| Add | `src/lib/saas/roles.ts` |
| Add | `src/lib/saas/dashboard-source.ts` |
| Add | `src/lib/saas/index.ts` |
| Add | `supabase/migrations/20260404100000_user_profiles.sql` |
| Add | `supabase/migrations/20260404110000_rls_attorney_advisor_write.sql` |
| Update | `prisma/schema.prisma` — `UserProfile` |
| Update | `src/lib/organizations/membershipRole.ts` — role aliases |
| Update | `src/lib/workspace-context.tsx` — export `useWorkspaceData` |

### Phase 2–5 (next implementation passes)

| Phase | Primary work |
|-------|----------------|
| 2 | Assessment APIs + consult rules only from DB flags; optional Supabase mirror. |
| 3 | Overview: server loaders or RSC + queries per widget; remove `getDashboardProfile` for `useSupabaseTenantData` orgs with no empty fallback, or normalize rows on org create. |
| 4 | CRUD APIs for meetings, votes, minutes, documents, training metadata. |
| 5 | Invites, notifications, archive, exports, admin UX. |

---

## 6. Seed strategy for demo organizations

1. **Prisma:** `isDemoTenant = true`, `demoProfileKey` set, `useSupabaseTenantData = true` for “real feel” demos.
2. **Env:** `SEED_SUPABASE_TENANT=1` + `SUPABASE_SERVICE_ROLE_KEY` when running seed so [`seedSupabaseTenantForDemoOrg`](../src/lib/tenant/seedSupabaseTenantData.ts) hydrates `tenant_*` tables.
3. **Reset:** [`POST /api/platform-admin/demo-tenants/[organizationId]/reset`](../src/app/api/platform-admin/demo-tenants/[organizationId]/reset/route.ts) re-applies template.
4. **Live customers:** `isDemoTenant = false`, `useSupabaseTenantData = true`, empty tenant → UI must show **empty states**, not JSON demos.

---

## 7. Migration path (mock → live)

1. Set **`useSupabaseTenantData = true`** on the org (Prisma).
2. Ensure **`organization_members`** in Supabase matches Prisma (existing **`POST /api/auth/sync-supabase-membership`**).
3. **Backfill** tenant rows (import or admin UI) so `mapSnapshotToProfile` does not rely on JSON fallback.
4. **Flip** org off mock: verify `/api/organizations/[id]/tenant-snapshot` returns full profile.
5. **Optional:** Move Prisma to **hosted Postgres** (Neon/Supabase) for single database operations story.

---

## 8. Overview section → future tables (Phase 3)

| UI block | Target source (normalized or `tenant_*`) |
|----------|------------------------------------------|
| Decision needed / focus hero | `tenant_vote_items`, `tenant_action_items`, `tenant_board_meetings` |
| Upcoming meeting | `tenant_board_meetings` |
| Compliance | `tenant_compliance_events` |
| Board health | `tenant_governance_items` + metrics |
| Weekly timeline | Derived from meetings, votes, actions, compliance |
| Quick insights | `tenant_board_insights` + governance insights from facts |
| Readiness / tabs | Aggregates from same + assessment completion (Phase 2) |
| Flagged issues | Risks + assessment flags + GC review queue (Prisma) |

---

## 9. Code references (foundation)

- **Org access:** [`assertOrgAccess`](../src/lib/organizations/orgAccess.ts)
- **Roles:** [`src/lib/saas/roles.ts`](../src/lib/saas/roles.ts), [`membershipRole.ts`](../src/lib/organizations/membershipRole.ts)
- **Data source policy:** [`src/lib/saas/dashboard-source.ts`](../src/lib/saas/dashboard-source.ts)
- **Live snapshot API:** [`tenant-snapshot/route.ts`](../src/app/api/organizations/[organizationId]/tenant-snapshot/route.ts)
