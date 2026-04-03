import { auth } from "@/auth";
import { canAccessVotingWorkspace } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function VotingLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/voting");
  }
  if (!canAccessVotingWorkspace(session.user.role)) {
    redirect("/forbidden?reason=vote");
  }
  return <>{children}</>;
}
