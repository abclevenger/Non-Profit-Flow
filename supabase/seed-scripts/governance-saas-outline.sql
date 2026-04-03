-- Outline: mirror Prisma seed users/orgs into Supabase after Auth sign-ups.
-- Prerequisite: each email exists in auth.users (Supabase Dashboard → Authentication).
-- Replace <...> placeholders with real UUIDs and Prisma Organization.id (cuid text).

-- 1) Platform operator
-- INSERT INTO public.platform_admins (user_id)
-- SELECT id FROM auth.users WHERE email ILIKE 'ashley@ymbs.pro';

-- 2) Profiles
-- INSERT INTO public.user_profiles (user_id, full_name, phone, timezone)
-- SELECT id, 'Ashley Clevenger', NULL, 'America/New_York' FROM auth.users WHERE email ILIKE 'ashley@ymbs.pro'
-- ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 3) Tenant shells (ids MUST match Prisma `Organization.id`)
-- INSERT INTO public.tenant_organizations (id, is_demo, demo_editing_enabled)
-- VALUES
--   ('<community_outreach_prisma_id>', true, false),
--   ('<legal_aid_prisma_id>', true, false),
--   ('<youth_alliance_prisma_id>', true, false)
-- ON CONFLICT (id) DO UPDATE SET is_demo = EXCLUDED.is_demo;

-- 4) Memberships (user_id = auth.users.id uuid)
-- INSERT INTO public.organization_members (organization_id, user_id, role, title, status) VALUES
--   ('<community_id>', (SELECT id FROM auth.users WHERE email ILIKE 'ashley@ymbs.pro'), 'PLATFORM_ADMIN', 'Agency owner', 'ACTIVE'),
--   ('<community_id>', (SELECT id FROM auth.users WHERE email ILIKE 'ed@community.org'), 'EXECUTIVE_DIRECTOR', 'Executive Director', 'ACTIVE');
-- ...repeat for each seed membership from prisma/seed-governance-saas.ts
