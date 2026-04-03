import { auth } from "@/auth";
import { canManageIssueRouting } from "@/lib/expert-review/permissions";
import { redirect } from "next/navigation";

/** Issue routing is limited to org roles that can manage routing (Owner / Admin in the active org). */
export default async function IssueRoutingSettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !canManageIssueRouting(session)) {
    redirect("/forbidden?reason=settings-routing");
  }
  return <>{children}</>;
}
