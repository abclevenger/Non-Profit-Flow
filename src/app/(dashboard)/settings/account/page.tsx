import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { membershipRoleDisplayLabel } from "@/lib/saas/roles";

export const metadata = {
  title: "My account | Non-Profit Flow",
};

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!session.user.activeOrganizationId) {
    redirect("/overview");
  }

  const u = session.user;
  const orgName = u.activeOrganization?.name ?? "Your organization";
  const roleLabel = membershipRoleDisplayLabel(u.membershipRole);
  const title = u.activeMembership?.title?.trim() || null;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">My account</h1>
        <p className="mt-2 text-sm text-stone-600">
          Signed-in profile and your role in the active workspace. Organization branding and admin tools are managed
          separately.
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-stone-500">Name</dt>
            <dd className="font-medium text-stone-900">{u.name ?? u.email}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Email</dt>
            <dd className="font-medium text-stone-900">{u.email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Workspace</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-stone-500">Organization</dt>
            <dd className="font-medium text-stone-900">{orgName}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Access level</dt>
            <dd className="font-medium text-stone-900">{roleLabel}</dd>
          </div>
          {title ? (
            <div>
              <dt className="text-stone-500">Title</dt>
              <dd className="font-medium text-stone-900">{title}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {u.canManageOrganizationSettings ? (
        <p className="text-center text-sm text-stone-600">
          <Link href="/settings" className="font-semibold text-stone-800 underline-offset-4 hover:underline">
            Organization settings
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-stone-500">
          Need changes to workspace settings? Contact an organization administrator.
        </p>
      )}
    </div>
  );
}
