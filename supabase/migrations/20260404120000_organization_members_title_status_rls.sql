-- Align Supabase `organization_members` with Prisma `OrganizationMembership`:
-- optional real-world `title`, `status` ACTIVE|INACTIVE (RLS treats only ACTIVE as a member).

ALTER TABLE public.organization_members
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ACTIVE';

CREATE OR REPLACE FUNCTION public.is_member_of_org (_org_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = _org_id
      AND m.user_id = auth.uid()
      AND coalesce(m.status, 'ACTIVE') = 'ACTIVE'
  );
$$;

-- Restore platform-admin bypass (see 20260403130000) and require ACTIVE membership for writes.
CREATE OR REPLACE FUNCTION public.can_write_tenant_org (_org_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_admin()
  OR EXISTS (
    SELECT 1
    FROM public.organization_members m
    JOIN public.tenant_organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _org_id
      AND m.user_id = auth.uid()
      AND coalesce(m.status, 'ACTIVE') = 'ACTIVE'
      AND m.role = ANY (
        ARRAY[
          'OWNER',
          'ADMIN',
          'EXECUTIVE_DIRECTOR',
          'STAFF',
          'BOARD_CHAIR',
          'ATTORNEY_ADVISOR'
        ]::text[]
      )
      AND (
        o.is_demo = false
        OR o.demo_editing_enabled = true
      )
  );
$$;
