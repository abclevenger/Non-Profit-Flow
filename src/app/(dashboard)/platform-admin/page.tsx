import { prisma } from "@/lib/prisma";
import { PlatformDemoResetPanel } from "./PlatformDemoResetPanel";

export default async function PlatformAdminPage() {
  const demos = await prisma.organization.findMany({
    where: { isDemoTenant: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      demoProfileKey: true,
      useSupabaseTenantData: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Platform administration</h1>
        <p className="mt-2 text-sm text-stone-600">
          Operator tools for seeded demo tenants. Live customer organizations are not listed here for reset.
        </p>
      </div>
      <PlatformDemoResetPanel organizations={demos} />
    </div>
  );
}
