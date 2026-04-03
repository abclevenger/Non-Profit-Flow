import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";
import { prisma } from "@/lib/prisma";

export default async function OrganizationMembersPage() {
  const session = await auth();
  if (!session?.user?.id || !canManageOrganizationSettings(session)) {
    redirect("/forbidden?reason=organization-settings");
  }
  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/overview");
  }

  const [org, rows] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, isDemoTenant: true },
    }),
    prisma.organizationMembership.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { email: true, name: true, allowDemoOrganizationAssignment: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Members</h1>
        <p className="mt-2 text-sm text-stone-600">
          {org?.name ?? "Organization"} — roles are enforced server-side on APIs and in Supabase RLS after
          membership sync.
          {org?.isDemoTenant ? " Demo tenant: restrict who can be assigned via user flags and platform admin." : null}
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white/90 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Demo OK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-stone-900">{m.user.name ?? "—"}</td>
                <td className="px-4 py-3 text-stone-700">{m.user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-800">
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {m.user.allowDemoOrganizationAssignment ? "Yes" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500">
        Invites and role changes will ship on dedicated admin APIs; this view is read-only for verification.
      </p>
    </div>
  );
}
