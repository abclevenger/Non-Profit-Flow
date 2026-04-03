# SaaS user, organization, and role model

This app uses **Prisma** (SQLite locally, Postgres in production) as the source of truth for users and tenants. **Supabase Auth** holds credentials; `User.supabaseAuthId` links the app user to `auth.users.id`. Nothing in the React tree hardcodes users—data comes from the database and `/api/auth/me`.

## Platform administrator (agency / master account)

- **Storage:** `User.isPlatformAdmin = true` (boolean on the app user row).
- **Per-organization access:** Either a real `OrganizationMembership` with role `PLATFORM_ADMIN`, or implicit access: session loading (`loadOrgSessionState`) and `assertOrgAccess` grant every organization when `isPlatformAdmin` is true, using a synthetic `PLATFORM_ADMIN` membership for orgs without a row.
- **Capabilities:** Enforced server-side via `isPlatformAdmin` checks and `assertPlatformAdmin` for operator routes (e.g. platform admin UI, demo reset). Org APIs use `assertOrgAccess`, which allows platform admins into any existing organization.

Assign the platform owner in Prisma:

```sql
-- After User row exists (created by seed or first login bridge)
UPDATE "User" SET "isPlatformAdmin" = true, "allowDemoOrganizationAssignment" = true
WHERE lower(email) = lower('ashley@ymbs.pro');
```

## Organizations

| Field        | Prisma                     | Notes                                      |
| ------------ | -------------------------- | ------------------------------------------ |
| id           | `Organization.id`          | cuid                                       |
| name         | `Organization.name`        |                                            |
| slug         | `Organization.slug`        | unique                                     |
| is_demo      | `Organization.isDemoTenant`| Demo mode + reset tooling                  |
| created_at   | `Organization.createdAt`   |                                            |

## User profiles (global, not org-specific)

| Spec field   | Prisma `UserProfile` | Fallback        |
| ------------ | -------------------- | --------------- |
| user id      | `userId` (PK, FK)    | `User.id`       |
| full_name    | `fullName`           | `User.name`     |
| phone        | `phone`              |                 |
| timezone     | `timezone`           |                 |
| avatar_url   | `avatarUrl`          | `User.image`    |
| created_at   | `createdAt`          |                 |

Job title in the **org** is `OrganizationMembership.title`, not `UserProfile.jobTitle` (legacy global field).

## Organization members (authoritative for permissions)

| Spec field    | Prisma                      |
| ------------- | --------------------------- |
| user_id       | `OrganizationMembership.userId` |
| organization_id | `OrganizationMembership.organizationId` |
| role          | `OrganizationMembership.role` (`OrganizationMembershipRole`) |
| title         | `OrganizationMembership.title` |
| is_active     | `status = 'ACTIVE' \| 'INACTIVE'` |
| joined_at     | `createdAt`                 |

## Role vocabulary

**Product / docs** names map to **stored** roles via `src/lib/saas/governance-roles.ts`:

| Product (`SaasGovernanceProductRole`) | Stored `OrganizationMembership.role` |
| ------------------------------------- | -------------------------------------- |
| platform_admin                        | `PLATFORM_ADMIN`                       |
| organization_admin                    | `ADMIN` (customer); `OWNER` = billing owner |
| board_chair                           | `BOARD_CHAIR`                          |
| board_member                          | `BOARD_MEMBER`                         |
| executive_director                    | `EXECUTIVE_DIRECTOR`                   |
| staff_member                          | `STAFF`                                |
| attorney_advisor                      | `ATTORNEY_ADVISOR`                     |

`User.isPlatformAdmin` is the **global** platform flag; `PLATFORM_ADMIN` on a membership labels agency access inside a tenant for reporting and Supabase sync.

## Permission summary

- **Platform admin:** Full access to all organizations (session + API), operator tools, assessments (see `np-assessment-permissions` + `isPlatformAdmin` shortcuts).
- **Organization admin (`ADMIN` / `OWNER`):** Manage org settings, members, routing, billing hooks.
- **Board chair / member:** Governance and assessment flows per `src/lib/np-assessment/np-assessment-permissions.ts` and `src/lib/auth/permissions.ts`.
- **Attorney advisor:** Consult / GC paths; no operational org admin unless also `ADMIN`.

## Workspace context and organization switcher

1. `getAppAuth` → `loadOrgSessionState(userId, cookieOrgId, { isPlatformAdmin })`.
2. Session exposes `user.organizations`, `activeOrganization`, `activeMembership`, `membershipRole`, flags like `canManageOrganizationSettings`.
3. Client: `OrganizationSwitcher` + `WorkspaceProvider` (`src/lib/workspace-context.tsx`) call `update({ activeOrganizationId })` → POST `/api/auth/active-organization` → refreshed `/api/auth/me`.

## Demo mode

- `Organization.isDemoTenant = true` marks demo/sales tenants.
- Platform admin reset UI: `src/app/(dashboard)/platform-admin/page.tsx` (demo orgs only).
- `demoMembershipPolicy` restricts who can be assigned to demo orgs unless platform admin or `allowDemoOrganizationAssignment`.

## Seeds (real DB data)

1. Base demo: `npm run db:seed` → `prisma/seed.ts`.
2. Governance SaaS cast: `npm run db:seed:saas` → `prisma/seed-governance-saas.ts` (Ashley @ platform, three orgs, sample users and memberships).

## Supabase (optional tenant mirror)

RLS helpers live under `supabase/migrations/`. `organization_members.role` accepts `PLATFORM_ADMIN` for writes where policy allows. Sync from Prisma: POST `/api/auth/sync-supabase-membership` after login.

### Example: insert script outline (run in SQL editor)

`auth.users` rows must exist first (sign up each email in Supabase Auth). Then resolve UUIDs:

```sql
-- Platform admins table (optional; app also checks Prisma via API)
INSERT INTO public.platform_admins (user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('ashley@ymbs.pro')
ON CONFLICT (user_id) DO NOTHING;

-- Profile (optional mirror of Prisma UserProfile)
INSERT INTO public.user_profiles (user_id, full_name, phone, timezone)
SELECT id, 'Ashley Clevenger', NULL, 'America/New_York'
FROM auth.users WHERE lower(email) = lower('ashley@ymbs.pro')
ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Tenant org + membership: use Prisma Organization.id as text PK
-- INSERT INTO public.tenant_organizations (id, is_demo) VALUES ('<prisma_org_cuid>', true);
-- INSERT INTO public.organization_members (organization_id, user_id, role, status)
-- VALUES ('<org_cuid>', '<auth_uuid>', 'PLATFORM_ADMIN', 'ACTIVE');
```

Replace IDs with values from your Prisma database (`npx prisma studio` or query `Organization` / `User` after seed).
