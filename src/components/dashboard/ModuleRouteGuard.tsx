"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOrganizationBranding } from "@/lib/organization-branding-context";

/**
 * Redirects away from module routes when the active org has that module disabled.
 */
export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isModulePathAllowed, loading } = useOrganizationBranding();

  useEffect(() => {
    if (loading) return;
    if (!isModulePathAllowed(pathname)) {
      router.replace("/overview");
    }
  }, [isModulePathAllowed, loading, pathname, router]);

  return <>{children}</>;
}
