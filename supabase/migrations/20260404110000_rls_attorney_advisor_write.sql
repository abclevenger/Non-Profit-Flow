-- Allow attorney advisors to edit tenant content under the same demo/live guard as other write roles.

CREATE OR REPLACE FUNCTION public.can_write_tenant_org (_org_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    JOIN public.tenant_organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _org_id
      AND m.user_id = auth.uid()
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
