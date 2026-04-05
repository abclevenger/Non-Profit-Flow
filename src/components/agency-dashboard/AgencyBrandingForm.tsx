"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  agencyId: string;
  initial: {
    brandingDisplayName: string | null;
    brandingLogoUrl: string | null;
    brandingPrimaryColor: string | null;
    brandingSupportEmail: string | null;
    brandingFooterText: string | null;
  };
};

export function AgencyBrandingForm({ agencyId, initial }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.brandingDisplayName ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.brandingLogoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(initial.brandingPrimaryColor ?? "#5c5347");
  const [supportEmail, setSupportEmail] = useState(initial.brandingSupportEmail ?? "");
  const [footer, setFooter] = useState(initial.brandingFooterText ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const r = await fetch(`/api/agencies/${agencyId}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brandingDisplayName: displayName,
          brandingLogoUrl: logoUrl,
          brandingPrimaryColor: primaryColor,
          brandingSupportEmail: supportEmail,
          brandingFooterText: footer,
        }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMsg(j.error ?? "Save failed");
        return;
      }
      setMsg("Saved.");
      router.refresh();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm">
      <div>
        <label className="text-xs font-bold uppercase text-stone-500">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-stone-500">Logo URL</label>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          placeholder="https://…"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-stone-500">Primary color</label>
        <input
          type="color"
          value={primaryColor.length === 7 ? primaryColor : "#5c5347"}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-stone-200"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-stone-500">Support email</label>
        <input
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-stone-500">Footer text</label>
        <textarea
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      {msg ? <p className="text-sm text-stone-600">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
      >
        {loading ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}
