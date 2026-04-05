import Link from "next/link";
import { redirect } from "next/navigation";
import { AgencyCreateNonprofitForm } from "@/components/agency-dashboard/AgencyCreateNonprofitForm";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";

export const dynamic = "force-dynamic";

export default async function AgencyNewNonprofitPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;
  if (!access.canManageAgency) {
    redirect(`/agency/${agencyId}/accounts`);
  }

  return (
    <div className="space-y-6">
      <Link href={`/agency/${agencyId}/accounts`} className="text-sm font-medium text-stone-600 hover:text-stone-900">
        ← Back to accounts
      </Link>
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Add nonprofit account</h1>
        <p className="mt-2 text-sm text-stone-600">
          Creates a real organization row, default modules, and settings — ready for team invites and assessments.
        </p>
      </header>
      <AgencyCreateNonprofitForm agencyId={agencyId} />
    </div>
  );
}
