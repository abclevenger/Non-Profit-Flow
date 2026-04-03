/**
 * Single policy for where dashboard `OrganizationProfile` data comes from.
 * @see docs/saas-transformation-master-plan.md
 */

export type DashboardProfileSource = "supabase_tenant" | "mock_bundle";

export type OrgDashboardFlags = {
  useSupabaseTenantData: boolean;
};

export function resolveDashboardProfileSource(org: OrgDashboardFlags | null | undefined): DashboardProfileSource {
  if (org?.useSupabaseTenantData) return "supabase_tenant";
  return "mock_bundle";
}

export function orgShouldFetchTenantSnapshot(org: OrgDashboardFlags | null | undefined): boolean {
  return resolveDashboardProfileSource(org) === "supabase_tenant";
}
