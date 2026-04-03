"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { OrganizationExtendedSettings } from "@/lib/organization-settings/extended-settings";

export function WorkspaceOperationalSettingsClient({ organizationId }: { organizationId: string }) {
  const formId = useId();
  const [extended, setExtended] = useState<OrganizationExtendedSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/organizations/${organizationId}/workspace-settings`, {
        credentials: "include",
        cache: "no-store",
      });
      const j = (await r.json()) as { extended?: OrganizationExtendedSettings; error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setExtended(j.extended ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
      setExtended(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    if (!extended) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const r = await fetch(`/api/organizations/${organizationId}/workspace-settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extended }),
      });
      const j = (await r.json()) as { extended?: OrganizationExtendedSettings; error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setExtended(j.extended ?? extended);
      setMessage("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [extended, organizationId]);

  if (loading || !extended) {
    return (
      <p className="text-sm text-stone-500">{loading ? "Loading workspace settings…" : error ?? "No data."}</p>
    );
  }

  return (
    <form
      id={formId}
      className="space-y-8 rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p>
      ) : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-900">Meeting defaults</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Default duration (minutes)</span>
            <input
              type="number"
              min={15}
              max={480}
              className="rounded-lg border border-stone-200 px-3 py-2"
              value={extended.meetingDefaults?.defaultDurationMinutes ?? 120}
              onChange={(e) =>
                setExtended({
                  ...extended,
                  meetingDefaults: {
                    ...extended.meetingDefaults,
                    defaultDurationMinutes: Number(e.target.value) || 120,
                  },
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Packet lead time (days)</span>
            <input
              type="number"
              min={0}
              max={30}
              className="rounded-lg border border-stone-200 px-3 py-2"
              value={extended.meetingDefaults?.packetLeadTimeDays ?? 7}
              onChange={(e) =>
                setExtended({
                  ...extended,
                  meetingDefaults: {
                    ...extended.meetingDefaults,
                    packetLeadTimeDays: Number(e.target.value) || 7,
                  },
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-900">Notifications</h2>
        <div className="flex flex-col gap-2 text-sm">
          {(
            [
              ["emailDigest", "Email digest"],
              ["meetingReminders", "Meeting reminders"],
              ["voteAlerts", "Vote alerts"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(extended.notificationPreferences?.[key])}
                onChange={(e) =>
                  setExtended({
                    ...extended,
                    notificationPreferences: {
                      ...extended.notificationPreferences,
                      [key]: e.target.checked,
                    },
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-900">Compliance preferences</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Filing reminder lead time (days)</span>
          <input
            type="number"
            min={1}
            max={120}
            className="max-w-xs rounded-lg border border-stone-200 px-3 py-2"
            value={extended.compliancePreferences?.filingCalendarReminderDays ?? 30}
            onChange={(e) =>
              setExtended({
                ...extended,
                compliancePreferences: {
                  ...extended.compliancePreferences,
                  filingCalendarReminderDays: Number(e.target.value) || 30,
                },
              })
            }
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-900">AI &amp; reports</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(extended.aiReportSettings?.enabled)}
            onChange={(e) =>
              setExtended({
                ...extended,
                aiReportSettings: { ...extended.aiReportSettings, enabled: e.target.checked },
              })
            }
          />
          Enable AI-assisted summaries
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(extended.aiReportSettings?.redactPii)}
            onChange={(e) =>
              setExtended({
                ...extended,
                aiReportSettings: { ...extended.aiReportSettings, redactPii: e.target.checked },
              })
            }
          />
          Redact PII in generated copy
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-900">Billing (placeholder)</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Plan label</span>
          <input
            type="text"
            className="max-w-md rounded-lg border border-stone-200 px-3 py-2"
            value={extended.billing?.planLabel ?? ""}
            onChange={(e) =>
              setExtended({
                ...extended,
                billing: { ...extended.billing, planLabel: e.target.value },
              })
            }
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
        >
          {saving ? "Saving…" : "Save workspace settings"}
        </button>
      </div>
    </form>
  );
}
