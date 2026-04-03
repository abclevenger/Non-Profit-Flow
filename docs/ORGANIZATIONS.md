# Organizations and multi-tenant model

This app is built for **many organizations** sharing one product. Each organization has its own branding, enabled modules, settings, memberships, and persisted data (reviews, routing rules, etc.).

## Data model (Prisma)

- **`Organization`** — Tenant root: `name`, `slug`, `missionSnippet`, `logoUrl`, `primaryColor`, `secondaryColor`, `accentColor`, plus future-ready fields (`industryType`, `onboardingStatus`, `demoModeEnabled`, `billingPlan`, `demoProfileKey`).
- **`OrganizationSettings`** — 1:1 with org: `themeMode`, `faviconUrl`, `customDomain`, `defaultLandingPage` (domain/billing not wired in UI yet).
- **`OrganizationModule`** — One row per module key (`STRATEGY`, `MEETINGS`, …) with `isEnabled`. Sidebar, `ModuleRouteGuard`, and overview widgets respect this map.
- **`OrganizationMembership`** — Links `User` ↔ `Organization` with `OrganizationMembershipRole` (`OWNER`, `ADMIN`, `BOARD_CHAIR`, `BOARD_MEMBER`, `STAFF`, `VIEWER`). The same user can have **different roles in different orgs**.
- **Scoped data** — e.g. `GcReviewRequest`, `ExpertReviewRequest`, `IssueRoutingRule` include `organizationId` and composite uniques so rows never collide across tenants.

## Session and active organization

- On sign-in, `loadOrgSessionState` (see `src/lib/auth/sessionOrganizations.ts`) loads all memberships, picks an active org (JWT `activeOrganizationId` if valid, else first membership), and attaches:
  - `session.user.organizations` — short list for the header switcher
  - `session.user.activeOrganization` — full branding + modules for the active org
  - Flags: `canManageOrganizationSettings`, `canManageIssueRouting`, `canViewAllExpertReviewsInOrg` (all **per active org membership**)

Switching orgs uses `next-auth` `update({ activeOrganizationId })` from `WorkspaceProvider` — no full page reload.

## Client workspace

- **`WorkspaceProvider`** / **`useWorkspace()`** (`src/lib/workspace-context.tsx`) — active org, `organizations`, `setActiveOrganization`, `refreshSession`, and the demo **`profile`** bundle from `getDashboardProfile(demoProfileKey)` when the org is a sample tenant.
- **`useDemoMode()`** — Deprecated shim: `profileId` is the sample profile key; `setProfileId` finds an org with matching `demoProfileKey` and switches. Prefer `useWorkspace()` for new code.

## Branding

- Colors and logo live on **`Organization`**; the branding provider merges them with the sample profile for fallbacks (`src/lib/organization-branding-context.tsx`, `src/lib/organization-settings/colors.ts`).
- **Settings UI** saves via `PATCH /api/organizations/[organizationId]` (Owner/Admin only, and user must be a member of that org).

## Modules

- Toggle modules in Settings; persistence is `OrganizationModule` rows. **`ModuleRouteGuard`** hides disabled routes; the sidebar filters nav items using `effectiveModules`.

## Issue routing

- Rules are **per organization**. API: `GET/PUT /api/issue-routing-rules` with `organizationId` (query for GET, body for PUT). Access: `canManageIssueRouting(session)`.

## Demo / sample organizations

- Seed creates multiple orgs with `demoProfileKey` pointing at bundled JSON profiles (`prisma/seed.ts`). Adding another sample org: create `Organization` + `OrganizationSettings` + `OrganizationModule` rows + memberships; set `demoProfileKey` to a `SampleProfileId` or extend profiles in `src/lib/mock-data/`.

## Future: URL-based tenants and billing

- Data is already keyed by `organizationId`; adding routes like `/org/[slug]/overview` is mostly routing + resolving slug → org + syncing session.
- **`billingPlan`** and `src/lib/organizations/billing.ts`** are placeholders for Starter / Growth / Enterprise (module caps, seats, white-label, exports, AI).

## Security notes

- APIs use **`assertOrgAccess`** (`src/lib/organizations/orgAccess.ts`) so `organizationId` in query/body must match a membership.
- **GC review PATCH** (`/api/gc-review/[id]`) checks the row’s `organizationId` before updating.
