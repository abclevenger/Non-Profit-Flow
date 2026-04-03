-- Multi-tenant board dashboard data (mirrors Prisma `Organization.id` as text cuid).
-- Apply in Supabase SQL editor or `supabase db push`. RLS uses `auth.uid()`; server may use service role after Prisma membership checks.

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_organizations (
  id text PRIMARY KEY,
  is_demo boolean NOT NULL DEFAULT false,
  demo_editing_enabled boolean NOT NULL DEFAULT false,
  demo_seed_version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS organization_members_org_id_idx ON public.organization_members (organization_id);

CREATE TABLE IF NOT EXISTS public.tenant_org_overlays (
  organization_id text PRIMARY KEY REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  reporting_period text,
  board_chair text,
  executive_director text,
  strategic_alignment_notes text,
  governance_notes text,
  meeting_prep_notes text,
  executive_update jsonb,
  board_agenda jsonb,
  board_training jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_strategic_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  owner text,
  progress int NOT NULL DEFAULT 0,
  status text NOT NULL,
  next_milestone text,
  due_date text,
  last_updated text,
  notes text,
  category text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tsp_org_idx ON public.tenant_strategic_priorities (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_risk_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  category text NOT NULL,
  status text NOT NULL,
  summary text NOT NULL,
  owner text,
  watchlist boolean DEFAULT false,
  trend text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tri_org_idx ON public.tenant_risk_items (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_governance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  label text NOT NULL,
  status text NOT NULL,
  detail text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tgi_org_idx ON public.tenant_governance_items (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_action_items (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  task text NOT NULL,
  owner text NOT NULL,
  due_date text NOT NULL,
  status text NOT NULL,
  overdue boolean NOT NULL DEFAULT false,
  linked_meeting_id text,
  linked_vote_id text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tai_org_idx ON public.tenant_action_items (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_document_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  last_updated text NOT NULL,
  href text NOT NULL,
  category text NOT NULL,
  download_allowed boolean DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tdi_org_idx ON public.tenant_document_items (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_key_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sublabel text,
  trend text,
  tone text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tkm_org_idx ON public.tenant_key_metrics (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_compliance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  label text NOT NULL,
  event_date text NOT NULL,
  status text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tce_org_idx ON public.tenant_compliance_events (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_board_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  href text,
  tone text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tbi_org_idx ON public.tenant_board_insights (organization_id, display_order);

-- Full `BoardMeeting` / `BoardVoteItem` / `MeetingMinutesRecord` JSON (matches app TypeScript types).
CREATE TABLE IF NOT EXISTS public.tenant_board_meetings (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tbm_org_idx ON public.tenant_board_meetings (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_vote_items (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tvi_org_idx ON public.tenant_vote_items (organization_id, display_order);

CREATE TABLE IF NOT EXISTS public.tenant_meeting_minutes (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.tenant_organizations (id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tmm_org_idx ON public.tenant_meeting_minutes (organization_id, display_order);

-- --- RLS ---
ALTER TABLE public.tenant_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_org_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_strategic_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_risk_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_governance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_key_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_board_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_vote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_meeting_minutes ENABLE ROW LEVEL SECURITY;

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
  );
$$;

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
      AND m.role = ANY (ARRAY['OWNER','ADMIN','EXECUTIVE_DIRECTOR','STAFF','BOARD_CHAIR'])
      AND (
        o.is_demo = false
        OR o.demo_editing_enabled = true
      )
  );
$$;

-- tenant_organizations: members can read their org row
CREATE POLICY tenant_org_select ON public.tenant_organizations
  FOR SELECT USING (public.is_member_of_org (id));

-- organization_members: see own org's roster
CREATE POLICY org_members_select ON public.organization_members
  FOR SELECT USING (public.is_member_of_org (organization_id));

-- Overlays & fact tables: read for members
CREATE POLICY tenant_overlays_select ON public.tenant_org_overlays
  FOR SELECT USING (public.is_member_of_org (organization_id));

CREATE POLICY tenant_overlays_write ON public.tenant_org_overlays
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tsp_select ON public.tenant_strategic_priorities
  FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tsp_write ON public.tenant_strategic_priorities
  FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tri_select ON public.tenant_risk_items FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tri_write ON public.tenant_risk_items FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tgi_select ON public.tenant_governance_items FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tgi_write ON public.tenant_governance_items FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tai_select ON public.tenant_action_items FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tai_write ON public.tenant_action_items FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tdi_select ON public.tenant_document_items FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tdi_write ON public.tenant_document_items FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tkm_select ON public.tenant_key_metrics FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tkm_write ON public.tenant_key_metrics FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tce_select ON public.tenant_compliance_events FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tce_write ON public.tenant_compliance_events FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tbi_select ON public.tenant_board_insights FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tbi_write ON public.tenant_board_insights FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tbm_select ON public.tenant_board_meetings FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tbm_write ON public.tenant_board_meetings FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tvi_select ON public.tenant_vote_items FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tvi_write ON public.tenant_vote_items FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

CREATE POLICY tmm_select ON public.tenant_meeting_minutes FOR SELECT USING (public.is_member_of_org (organization_id));
CREATE POLICY tmm_write ON public.tenant_meeting_minutes FOR ALL USING (public.can_write_tenant_org (organization_id))
  WITH CHECK (public.can_write_tenant_org (organization_id));

-- Service role bypasses RLS by default.
