"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartAssessmentButton({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        setError(null);
        try {
          const r = await fetch(`/api/organizations/${organizationId}/np-assessments`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          const j = (await r.json()) as { assessment?: { id: string }; error?: string };
          if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
          if (j.assessment?.id) {
            router.push(`/assessment/take/${j.assessment.id}`);
            router.refresh();
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not start assessment");
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
      style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
    >
      {busy ? "Starting…" : "Start new assessment"}
    </button>
    </div>
  );
}
