import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrganizationBrandingProvider } from "@/lib/organization-branding-context";
import { DashboardProfileProvider } from "@/lib/workspace/useDashboardProfile";
import { WorkspaceProvider } from "@/lib/workspace-context";

export default function DashboardGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceProvider>
      <DashboardProfileProvider>
        <OrganizationBrandingProvider>
          <DashboardShell>{children}</DashboardShell>
        </OrganizationBrandingProvider>
      </DashboardProfileProvider>
    </WorkspaceProvider>
  );
}