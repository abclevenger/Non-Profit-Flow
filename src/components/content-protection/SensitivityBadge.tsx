export type SensitivityVariant = "confidential" | "boardOnly" | "restricted";

const labels: Record<SensitivityVariant, string> = {
  confidential: "Confidential",
  boardOnly: "Board only",
  restricted: "Restricted access",
};

const styles: Record<SensitivityVariant, string> = {
  confidential: "bg-rose-50 text-rose-900 ring-rose-200/80",
  boardOnly: "bg-stone-100 text-stone-800 ring-stone-300/80",
  restricted: "bg-amber-50 text-amber-950 ring-amber-200/80",
};

export function SensitivityBadge({ variant }: { variant: SensitivityVariant }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${styles[variant]}`}
    >
      {labels[variant]}
    </span>
  );
}
