import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrganizationBrandingProvider } from "@/lib/organization-branding-context";
import { DashboardProfileProvider } from "@/lib/workspace/useDashboardProfile";
import { WorkspaceProvider } from "@/lib/workspace-context";

// Prisma-backed pages under this group must not run at build time (no DATABASE_URL on Vercel build workers).
export const dynamic = "force-dynamic";

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