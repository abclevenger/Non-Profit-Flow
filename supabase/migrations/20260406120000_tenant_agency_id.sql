-- Link Supabase tenant shell to Prisma `Agency.id` (text cuid) for future RLS / reporting.

ALTER TABLE public.tenant_organizations
  ADD COLUMN IF NOT EXISTS agency_id text;

CREATE INDEX IF NOT EXISTS tenant_organizations_agency_id_idx ON public.tenant_organizations (agency_id);
