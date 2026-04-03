import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrganizationBrandingProvider } from "@/lib/organization-branding-context";
import { WorkspaceProvider } from "@/lib/workspace-context";

export default function DashboardGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceProvider>
      <OrganizationBrandingProvider>
        <DashboardShell>{children}</DashboardShell>
      </OrganizationBrandingProvider>
    </WorkspaceProvider>
  );
}