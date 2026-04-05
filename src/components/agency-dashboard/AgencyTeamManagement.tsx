"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { AgencyTeamMemberRow } from "@/lib/agency-dashboard/types";

function displayName(m: AgencyTeamMemberRow): string {
  return m.fullName?.trim() || m.name?.trim() || m.email;
}

export function AgencyTeamManagement({
  agencyId,
  members,
  agencyAccounts,
  canManage,
}: {
  agencyId: string;
  members: AgencyTeamMemberRow[];
  agencyAccounts: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"AGENCY_ADMIN" | "AGENCY_STAFF">("AGENCY_STAFF");

  const [assignUserId, setAssignUserId] = useState<string | null>(null);
  const [assignSelection, setAssignSelection] = useState<Set<string>>(new Set());

  const openAssign = useCallback(
    (m: AgencyTeamMemberRow) => {
      setAssignUserId(m.userId);
      setAssignSelection(new Set(m.nonprofits.map((o) => o.id)));
      setErr(null);
    },
    [],
  );

  const closeAssign = useCallback(() => {
    setAssignUserId(null);
    setAssignSelection(new Set());
  }, []);

  const toggleOrg = useCallback((orgId: string) => {
    setAssignSelection((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });
  }, []);

  const saveAssign = useCallback(async () => {
    if (!assignUserId) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/agencies/${agencyId}/team/${assignUserId}/accounts`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationIds: [...assignSelection] }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      closeAssign();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }, [agencyId, assignUserId, assignSelection, closeAssign, router]);

  const patchMember = useCallback(
    async (userId: string, body: { role?: string; status?: string }) => {
      setBusy(true);
      setErr(null);
      try {
        const r = await fetch(`/api/agencies/${agencyId}/team/${userId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const j = (await r.json()) as { error?: string };
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusy(false);
      }
    },
    [agencyId, router],
  );

  const invite = useCallback(async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/agencies/${agencyId}/team/invite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setInviteEmail("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }, [agencyId, inviteEmail, inviteRole, router]);

  return (
    <div className="space-y-6">
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{err}</p>
      ) : null}

      {canManage ? (
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Invite team member</h2>
          <p className="mt-1 text-sm text-stone-600">
            Adds or reactivates an <code className="rounded bg-stone-100 px-1 text-xs">AgencyMember</code>. If the user
            is new to the app, they can sign in with this email to access the agency hub.
          </p>
          <div className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-xs font-medium text-stone-600">
              Email
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="name@firm.com"
              />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Role
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm sm:w-40"
              >
                <option value="AGENCY_STAFF">Agency staff</option>
                <option value="AGENCY_ADMIN">Agency admin</option>
              </select>
            </label>
            <button
              type="button"
              disabled={busy || !inviteEmail.trim()}
              onClick={() => void invite()}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {busy ? "Saving…" : "Invite"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/90 text-[11px] font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Agency role</th>
              <th className="px-4 py-3">Nonprofit accounts</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last active</th>
              {canManage ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 7 : 6} className="px-4 py-12 text-center text-sm text-stone-500">
                  No team members yet.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.userId} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3 font-medium text-stone-900">{displayName(m)}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">{m.email}</td>
                  <td className="px-4 py-3 text-xs text-stone-700">
                    {m.agencyRole === "OWNER"
                      ? "Owner"
                      : m.agencyRole === "AGENCY_ADMIN"
                        ? "Agency admin"
                        : "Agency staff"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-stone-600">
                    {m.nonprofits.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="space-y-0.5">
                        {m.nonprofits.map((o) => (
                          <li key={o.id}>{o.name}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{m.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">
                    {m.lastActiveAt ? m.lastActiveAt.toLocaleString() : "—"}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy || agencyAccounts.length === 0}
                          onClick={() => openAssign(m)}
                          className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50"
                        >
                          Assign accounts
                        </button>
                        {m.agencyRole !== "OWNER" ? (
                          <>
                            <select
                              disabled={busy || m.status !== "ACTIVE"}
                              value={m.agencyRole === "AGENCY_ADMIN" ? "AGENCY_ADMIN" : "AGENCY_STAFF"}
                              onChange={(e) => {
                                const role = e.target.value;
                                if (role === "AGENCY_ADMIN" || role === "AGENCY_STAFF") {
                                  void patchMember(m.userId, { role });
                                }
                              }}
                              className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium"
                            >
                              <option value="AGENCY_STAFF">Staff</option>
                              <option value="AGENCY_ADMIN">Admin</option>
                            </select>
                            {m.status === "ACTIVE" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void patchMember(m.userId, { status: "INACTIVE" })}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void patchMember(m.userId, { status: "ACTIVE" })}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                              >
                                Reactivate
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {assignUserId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-stone-900">Assign nonprofit accounts</h3>
            <p className="mt-1 text-sm text-stone-600">
              Grants <span className="font-medium">Staff</span> workspace access. Existing board or admin roles are not
              removed.
            </p>
            <ul className="mt-4 max-h-60 space-y-2 overflow-y-auto border-y border-stone-100 py-3">
              {agencyAccounts.map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={assignSelection.has(o.id)}
                      onChange={() => toggleOrg(o.id)}
                      className="mt-1"
                    />
                    <span>{o.name}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAssign}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveAssign()}
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
