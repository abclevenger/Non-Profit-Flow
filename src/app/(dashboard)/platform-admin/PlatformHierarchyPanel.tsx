"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { PlatformAgencyRow, PlatformOrganizationRow } from "@/lib/platform-admin/load-hierarchy";

export function PlatformHierarchyPanel({
  agencies,
  organizations,
}: {
  agencies: PlatformAgencyRow[];
  organizations: PlatformOrganizationRow[];
}) {
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [createWl, setCreateWl] = useState(false);
  const [createDemoAgency, setCreateDemoAgency] = useState(false);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [assignErr, setAssignErr] = useState<string | null>(null);

  const [assignOrgId, setAssignOrgId] = useState(organizations[0]?.id ?? "");
  const [assignAgencyId, setAssignAgencyId] = useState(agencies[0]?.id ?? "");

  const createAgency = useCallback(async () => {
    setBusy(true);
    setCreateMsg(null);
    setCreateErr(null);
    try {
      const r = await fetch("/api/platform-admin/agencies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          isWhiteLabel: createWl,
          isDemoAgency: createDemoAgency,
          ...(ownerUserId.trim() ? { ownerUserId: ownerUserId.trim() } : {}),
        }),
      });
      const j = (await r.json()) as { error?: string; id?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setCreateMsg("Agency created.");
      setCreateName("");
      setCreateWl(false);
      setCreateDemoAgency(false);
      setOwnerUserId("");
      router.refresh();
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }, [createName, createWl, createDemoAgency, ownerUserId, router]);

  const assignAgency = useCallback(async () => {
    if (!assignOrgId || !assignAgencyId) return;
    setBusy(true);
    setAssignMsg(null);
    setAssignErr(null);
    try {
      const r = await fetch(`/api/platform-admin/organizations/${assignOrgId}/agency`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId: assignAgencyId }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setAssignMsg("Organization moved to the selected agency.");
      router.refresh();
    } catch (e) {
      setAssignErr(e instanceof Error ? e.message : "Assignment failed");
    } finally {
      setBusy(false);
    }
  }, [assignOrgId, assignAgencyId, router]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Agencies</h2>
        <p className="mt-1 text-sm text-stone-600">
          Platform owner view of every agency. Open an agency hub to manage nonprofit accounts, team, consult queue, and
          branding.
        </p>
        {agencies.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">No agencies yet. Create one below.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Accounts</th>
                  <th className="px-4 py-3">Agency team</th>
                  <th className="px-4 py-3">Demo</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {agencies.map((a) => (
                  <tr key={a.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-stone-900">{a.name}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {a.owner.name || a.owner.email}
                      <span className="mt-0.5 block text-xs text-stone-400">{a.owner.email}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{a.nonprofitCount}</td>
                    <td className="px-4 py-3 text-stone-700">{a.agencyMemberCount}</td>
                    <td className="px-4 py-3 text-stone-600">{a.isDemoAgency ? "Yes" : "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{a.isWhiteLabel ? "White-label" : "Agency"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/agency/${a.id}`}
                        className="text-sm font-semibold text-stone-800 underline underline-offset-2"
                      >
                        Open hub
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Create agency</h2>
        <p className="mt-1 text-sm text-stone-600">
          New agencies are backed by real `Agency` rows. You are the billing/agency owner unless you pass another user
          id.
        </p>
        <div className="mt-4 flex max-w-xl flex-col gap-3">
          <label className="text-xs font-medium text-stone-600">
            Agency name
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="e.g. Riverside Legal Group LLP"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={createWl} onChange={(e) => setCreateWl(e.target.checked)} />
            White-label agency
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={createDemoAgency} onChange={(e) => setCreateDemoAgency(e.target.checked)} />
            Demo agency (attach bench user member@board.demo)
          </label>
          <label className="text-xs font-medium text-stone-600">
            Owner user id (optional)
            <input
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs"
              placeholder="cuid — defaults to you"
            />
          </label>
          {createMsg ? <p className="text-sm text-emerald-800">{createMsg}</p> : null}
          {createErr ? <p className="text-sm text-red-800">{createErr}</p> : null}
          <button
            type="button"
            disabled={busy || !createName.trim()}
            onClick={() => void createAgency()}
            className="w-fit rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {busy ? "Saving…" : "Create agency"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Assign nonprofit to agency</h2>
        <p className="mt-1 text-sm text-stone-600">
          Moves the organization&apos;s <code className="rounded bg-stone-100 px-1 text-xs">agencyId</code> — use when
          onboarding or correcting hierarchy.
        </p>
        {organizations.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">No organizations in the database.</p>
        ) : (
          <div className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-xs font-medium text-stone-600">
              Organization
              <select
                value={assignOrgId}
                onChange={(e) => setAssignOrgId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              >
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.agencyName}){o.isDemoTenant ? " · demo" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 flex-1 text-xs font-medium text-stone-600">
              Target agency
              <select
                value={assignAgencyId}
                onChange={(e) => setAssignAgencyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              >
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy || !assignOrgId || !assignAgencyId}
              onClick={() => void assignAgency()}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        )}
        {assignMsg ? <p className="mt-3 text-sm text-emerald-800">{assignMsg}</p> : null}
        {assignErr ? <p className="mt-3 text-sm text-red-800">{assignErr}</p> : null}
      </section>
    </div>
  );
}
