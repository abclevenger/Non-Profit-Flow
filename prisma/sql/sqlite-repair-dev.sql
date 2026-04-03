-- Align local SQLite with prisma/schema.prisma when `db push` cannot auto-migrate.
-- From repo root (stop `next dev` first if you hit file locks):
--   npx prisma db execute --file prisma/sql/sqlite-repair-dev.sql --schema prisma/schema.prisma
--   npx prisma generate
-- If any ALTER fails with "duplicate column", comment out that block and re-run.
-- Then: npx prisma db push

PRAGMA foreign_keys = OFF;

-- User: Supabase Auth id (fixes P2022 on /assessment, get-app-auth).
ALTER TABLE "User" ADD COLUMN "supabaseAuthId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseAuthId_key" ON "User"("supabaseAuthId");

-- Organization: Stripe ids
ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "stripeSubscriptionId" TEXT;

-- OrganizationMembership: team member title + status
ALTER TABLE "OrganizationMembership" ADD COLUMN "title" TEXT;
ALTER TABLE "OrganizationMembership" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- IssueRoutingRule: tenant scope + backfill (enables `prisma db push` afterward)
ALTER TABLE "IssueRoutingRule" ADD COLUMN "organizationId" TEXT;

UPDATE "IssueRoutingRule"
SET "organizationId" = (
  SELECT "id" FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1
)
WHERE "organizationId" IS NULL;

-- UserProfile: display overrides (spec: full_name, avatar_url)
ALTER TABLE "UserProfile" ADD COLUMN "fullName" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "avatarUrl" TEXT;

-- Agency layer (Platform → Agency → Organization). Run after `Agency` / `AgencyMember` tables exist from `db push`.
-- If `Organization.agencyId` is missing, create a fallback agency and backfill (adjust owner user id as needed).
-- ALTER TABLE "Organization" ADD COLUMN "agencyId" TEXT;
-- CREATE TABLE "Agency" (...);
-- UPDATE "Organization" SET "agencyId" = (SELECT "id" FROM "Agency" LIMIT 1) WHERE "agencyId" IS NULL;

PRAGMA foreign_keys = ON;
