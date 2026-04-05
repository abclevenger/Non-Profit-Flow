import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencySettingsPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const owner = await prisma.user.findUnique({
    where: { id: access.agency.ownerUserId },
    select: { name: true, email: true },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Agency settings</h1>
        <p className="mt-2 text-sm text-stone-600">Profile, ownership, and operational placeholders.</p>
      </header>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Agency profile</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-stone-500">Name</dt>
            <dd className="font-medium text-stone-900">{access.agency.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-stone-500">Agency ID</dt>
            <dd className="font-mono text-xs text-stone-700">{agencyId}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-stone-500">White-label</dt>
            <dd className="text-stone-800">{access.agency.isWhiteLabel ? "Enabled" : "Standard"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Owner</h2>
        <p className="mt-2 text-sm text-stone-600">
          {owner?.name ?? "—"} · {owner?.email ?? "—"}
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-6">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Notifications</h2>
        <p className="mt-2 text-sm text-stone-600">
          Per-agency notification routing will connect to email and in-app alerts. Placeholder for v2.
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-6">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Billing</h2>
        <p className="mt-2 text-sm text-stone-600">Stripe billing at organization level today; agency-level plans TBD.</p>
      </section>

      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-6">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Integrations</h2>
        <p className="mt-2 text-sm text-stone-600">CRM, calendar, and e-signature hooks — roadmap.</p>
      </section>
    </div>
  );
}
