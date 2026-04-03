-- Platform operators: full read/write on tenant tables (still subject to app-layer checks for Prisma).
-- Populate `platform_admins` with Supabase `auth.users.id` for operators who should bypass member-scoped RLS in the browser.

CREATE OR REPLACE FUNCTION public.is_platform_admin ()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins p
    WHERE p.user_id = auth.uid()
  );
$$;

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
      AND m.role = ANY (ARRAY['OWNER','ADMIN','EXECUTIVE_DIRECTOR','STAFF','BOARD_CHAIR'])
      AND (
        o.is_demo = false
        OR o.demo_editing_enabled = true
      )
  );
$$;

-- Replace SELECT policies to include platform admin
DROP POLICY IF EXISTS tenant_org_select ON public.tenant_organizations;
CREATE POLICY tenant_org_select ON public.tenant_organizations
  FOR SELECT USING (public.is_member_of_org (id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS org_members_select ON public.organization_members;
CREATE POLICY org_members_select ON public.organization_members
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tenant_overlays_select ON public.tenant_org_overlays;
CREATE POLICY tenant_overlays_select ON public.tenant_org_overlays
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tenant_overlays_write ON public.tenant_org_overlays;
CREATE POLICY tenant_overlays_write ON public.tenant_org_overlays
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tsp_select ON public.tenant_strategic_priorities;
CREATE POLICY tsp_select ON public.tenant_strategic_priorities
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tsp_write ON public.tenant_strategic_priorities;
CREATE POLICY tsp_write ON public.tenant_strategic_priorities
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tri_select ON public.tenant_risk_items;
CREATE POLICY tri_select ON public.tenant_risk_items
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tri_write ON public.tenant_risk_items;
CREATE POLICY tri_write ON public.tenant_risk_items
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tgi_select ON public.tenant_governance_items;
CREATE POLICY tgi_select ON public.tenant_governance_items
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tgi_write ON public.tenant_governance_items;
CREATE POLICY tgi_write ON public.tenant_governance_items
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tai_select ON public.tenant_action_items;
CREATE POLICY tai_select ON public.tenant_action_items
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tai_write ON public.tenant_action_items;
CREATE POLICY tai_write ON public.tenant_action_items
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tdi_select ON public.tenant_document_items;
CREATE POLICY tdi_select ON public.tenant_document_items
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tdi_write ON public.tenant_document_items;
CREATE POLICY tdi_write ON public.tenant_document_items
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tkm_select ON public.tenant_key_metrics;
CREATE POLICY tkm_select ON public.tenant_key_metrics
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tkm_write ON public.tenant_key_metrics;
CREATE POLICY tkm_write ON public.tenant_key_metrics
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tce_select ON public.tenant_compliance_events;
CREATE POLICY tce_select ON public.tenant_compliance_events
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tce_write ON public.tenant_compliance_events;
CREATE POLICY tce_write ON public.tenant_compliance_events
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tbi_select ON public.tenant_board_insights;
CREATE POLICY tbi_select ON public.tenant_board_insights
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tbi_write ON public.tenant_board_insights;
CREATE POLICY tbi_write ON public.tenant_board_insights
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tbm_select ON public.tenant_board_meetings;
CREATE POLICY tbm_select ON public.tenant_board_meetings
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tbm_write ON public.tenant_board_meetings;
CREATE POLICY tbm_write ON public.tenant_board_meetings
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tvi_select ON public.tenant_vote_items;
CREATE POLICY tvi_select ON public.tenant_vote_items
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tvi_write ON public.tenant_vote_items;
CREATE POLICY tvi_write ON public.tenant_vote_items
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

DROP POLICY IF EXISTS tmm_select ON public.tenant_meeting_minutes;
CREATE POLICY tmm_select ON public.tenant_meeting_minutes
  FOR SELECT USING (public.is_member_of_org (organization_id) OR public.is_platform_admin ());

DROP POLICY IF EXISTS tmm_write ON public.tenant_meeting_minutes;
CREATE POLICY tmm_write ON public.tenant_meeting_minutes
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));
