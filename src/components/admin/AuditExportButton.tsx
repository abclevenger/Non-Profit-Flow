"use client";

export function AuditExportButton() {
  return (
    <button
      type="button"
      className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800"
      onClick={async () => {
        const res = await fetch("/api/audit/content-access");
        if (!res.ok) {
          window.alert("Could not export — check that you are signed in as an admin.");
          return;
        }
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `content-access-log-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Export JSON
    </button>
  );
}
