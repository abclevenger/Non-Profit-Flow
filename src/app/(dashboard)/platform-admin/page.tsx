import { prisma } from "@/lib/prisma";
import {
  loadPlatformAgenciesOverview,
  loadPlatformOrganizationsForAssignment,
} from "@/lib/platform-admin/load-hierarchy";
import { PlatformDemoResetPanel } from "./PlatformDemoResetPanel";
import { PlatformHierarchyPanel } from "./PlatformHierarchyPanel";

export default async function PlatformAdminPage() {
  const [demos, agencies, organizations] = await Promise.all([
    prisma.organization.findMany({
      where: { isDemoTenant: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        demoProfileKey: true,
        useSupabaseTenantData: true,
      },
    }),
    loadPlatformAgenciesOverview(),
    loadPlatformOrganizationsForAssignment(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-2">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Platform hub</h1>
        <p className="mt-2 max-w-3xl text-sm text-stone-600">
          Master operator view: agencies and nonprofit accounts (GoHighLevel-style hierarchy), then demo reset tools.
          Drill down: open an agency hub → manage accounts → use the nonprofit workspace switcher to enter a client
          org.
        </p>
      </div>

      <PlatformHierarchyPanel agencies={agencies} organizations={organizations} />

      <div>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Demo tenant reset</h2>
        <p className="mt-1 text-sm text-stone-600">
          Re-seed Supabase tenant tables from each org&apos;s profile template. Live (non-demo) orgs are not listed.
        </p>
        <div className="mt-4">
          <PlatformDemoResetPanel organizations={demos} />
        </div>
      </div>
    </div>
  );
}
