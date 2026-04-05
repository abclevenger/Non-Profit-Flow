import { AgencyBrandingForm } from "@/components/agency-dashboard/AgencyBrandingForm";
import { AgencyEmptyState } from "@/components/agency-dashboard/AgencyEmptyState";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";

export const dynamic = "force-dynamic";

export default async function AgencyBrandingPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Branding</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          White-label controls for client-facing surfaces. Stored on the agency record.
        </p>
      </header>

      {!access.agency.isWhiteLabel ? (
        <AgencyEmptyState
          title="White-label is not enabled"
          description="Upgrade this agency to unlock custom logo, colors, and support copy for partner-branded experiences."
          action={
            access.canManageAgency ? (
              <p className="text-sm text-stone-600">
                Set <code className="rounded bg-stone-100 px-1">isWhiteLabel = true</code> in the database or contact
                platform operations.
              </p>
            ) : null
          }
        />
      ) : !access.canManageAgency ? (
        <AgencyEmptyState title="View only" description="Ask an agency admin to update branding settings." />
      ) : (
        <AgencyBrandingForm
          agencyId={agencyId}
          initial={{
            brandingDisplayName: access.agency.brandingDisplayName,
            brandingLogoUrl: access.agency.brandingLogoUrl,
            brandingPrimaryColor: access.agency.brandingPrimaryColor,
            brandingSupportEmail: access.agency.brandingSupportEmail,
            brandingFooterText: access.agency.brandingFooterText,
          }}
        />
      )}
    </div>
  );
}
