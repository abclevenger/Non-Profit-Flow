import Link from "next/link";
import { AuditExportButton } from "@/components/admin/AuditExportButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const items = await prisma.contentAccessLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/overview"
            className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline"
          >
            Back to overview
          </Link>
          <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Content access log
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Recent document, vote, minutes, and meeting events recorded for signed-in users (demo). Admins only.
          </p>
        </div>
        <AuditExportButton />
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200/90 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50/90 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No entries yet — open documents, votes, or meetings while signed in.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="text-stone-800">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                    {row.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs" title={row.user?.email ?? ""}>
                    {row.user?.name ?? "—"}
                    <br />
                    <span className="text-stone-500">{row.user?.email ?? row.userId ?? "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{row.resourceType}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-xs" title={row.resourceKey}>
                    {row.resourceKey}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-stone-600">
                    {row.href ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
