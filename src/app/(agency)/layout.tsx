import { DashboardProfileProvider } from "@/lib/workspace/useDashboardProfile";
import { WorkspaceProvider } from "@/lib/workspace-context";

// Agency pages use Prisma; skip static prerender so builds do not require DATABASE_URL at compile time.
export const dynamic = "force-dynamic";

export default function AgencyRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <DashboardProfileProvider>{children}</DashboardProfileProvider>
    </WorkspaceProvider>
  );
}
