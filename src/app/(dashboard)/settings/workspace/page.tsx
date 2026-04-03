import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WorkspaceOperationalSettingsClient } from "@/components/organization-settings/WorkspaceOperationalSettingsClient";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";

export default async function WorkspaceOperationalSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !canManageOrganizationSettings(session)) {
    redirect("/forbidden?reason=organization-settings");
  }
  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/overview");
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Workspace operations</h1>
        <p className="mt-2 text-sm text-stone-600">
          Board structure, committees, compliance and notification preferences, meeting defaults, voting, and AI
          reporting — stored on the organization (not in the Supabase tenant snapshot).
        </p>
      </div>
      <WorkspaceOperationalSettingsClient organizationId={organizationId} />
    </div>
  );
}
