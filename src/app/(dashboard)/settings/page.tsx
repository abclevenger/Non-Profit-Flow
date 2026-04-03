import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OrganizationSettingsView } from "@/components/organization-settings/OrganizationSettingsView";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";

export default async function OrganizationSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !canManageOrganizationSettings(session)) {
    redirect("/forbidden?reason=organization-settings");
  }
  return <OrganizationSettingsView />;
}
