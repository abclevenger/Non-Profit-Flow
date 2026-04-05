import { DashboardProfileProvider } from "@/lib/workspace/useDashboardProfile";
import { WorkspaceProvider } from "@/lib/workspace-context";

export default function AgencyRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <DashboardProfileProvider>{children}</DashboardProfileProvider>
    </WorkspaceProvider>
  );
}
