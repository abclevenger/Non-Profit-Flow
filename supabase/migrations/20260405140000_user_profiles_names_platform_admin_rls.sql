-- Spec: user_profiles.full_name, avatar_url; tenant writes for PLATFORM_ADMIN org role.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

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
          'PLATFORM_ADMIN',
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
