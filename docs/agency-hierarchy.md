# Platform → Agency → Organization hierarchy

GoHighLevel-style layering: **platform operators** own the product, **agencies** (law firms, MSPs, regional partners) white-label or bundle multiple **nonprofit organizations**, each with **team members** via `OrganizationMembership`.

## Prisma (source of truth)

### `Agency`

| Field           | Notes                                      |
| --------------- | ------------------------------------------ |
| `id`            | cuid                                       |
| `name`          | Display name                               |
| `ownerUserId`   | Primary billing / legal owner (`User.id`)  |
| `isWhiteLabel`  | Reseller / firm-branded programs           |
| `createdAt`     |                                            |

### `AgencyMember`

| Field      | Notes                                      |
| ---------- | ------------------------------------------ |
| `userId`   |                                            |
| `agencyId` |                                            |
| `role`     | `AGENCY_ADMIN` \| `AGENCY_STAFF`           |
| `status`   | `ACTIVE` \| `INACTIVE`                     |

### `Organization`

- Required `agencyId` — every nonprofit belongs to exactly one agency.

## Access rules (server)

| Actor            | Scope                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| `User.isPlatformAdmin` | All agencies, all organizations (session + `assertOrgAccess`). |
| Agency owner / `AGENCY_ADMIN` / `AGENCY_STAFF` | All orgs under that agency (plus direct org memberships elsewhere). |
| Org membership only | Only organizations where `OrganizationMembership` is `ACTIVE`. |

`assertOrgAccess` (`src/lib/organizations/orgAccess.ts`) allows:

1. Active org membership  
2. Platform admin synthetic `PLATFORM_ADMIN`  
3. Agency seat on the org’s `agencyId` (synthetic org role: `STAFF` for admin/owner, `VIEWER` for staff)

## Session & workspace

- `loadOrgSessionState` (`src/lib/auth/sessionOrganizations.ts`) returns `WorkspaceSessionState`: agencies list, `activeAgencyId`, `agencyScopeIsAll` (platform), full `organizations`, etc.
- Cookies: `gf-active-agency-id` (`ALL_AGENCIES_COOKIE_VALUE` = `__all__` for platform-wide org picker).
- UI: **Agency** switcher above **Organization** switcher (`DashboardHeader`).

## TypeScript

- Agency roles: `src/lib/agencies/agencyRole.ts`, `src/lib/agencies/agencyAccess.ts`
- Client-safe constant: `src/lib/auth/workspace-constants.ts` (`ALL_AGENCIES_COOKIE_VALUE`)

## SQL (Postgres / Supabase)

Prisma migrations or `db push` create `Agency` / `AgencyMember` / `Organization.agency_id`.

Optional mirror on `tenant_organizations.agency_id`: `supabase/migrations/20260406120000_tenant_agency_id.sql`.

## Seeds

- `prisma/seed.ts` — single **Demo Platform Agency** owned by board admin; all demo orgs attach to it.
- `npm run db:seed:saas` — **Community Impact Partners** (main) + **Riverside Legal Group LLP** (white-label); nonprofits split across agencies; `AgencyMember` rows for Ashley, legal lead, and agency staff.

## SQLite repair

If a local DB predates agencies, run `npx prisma db push` (or repair SQL in `prisma/sql/sqlite-repair-dev.sql` comments), then re-seed or backfill `agencyId` on `Organization`.
