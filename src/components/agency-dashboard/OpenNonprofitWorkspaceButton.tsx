"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";

export function OpenNonprofitWorkspaceButton({
  organizationId,
  className,
  children = "Open workspace",
}: {
  organizationId: string;
  className?: string;
  children?: ReactNode;
}) {
  const { setActiveOrganization } = useWorkspace();
  const router = useRouter();

  return (
    <button
      type="button"
      className={
        className ??
        "rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
      }
      onClick={() => {
        void setActiveOrganization(organizationId).then(() => {
          router.push("/overview");
        });
      }}
    >
      {children}
    </button>
  );
}
