/** Stored values (Prisma / API). */
export type NpAnswerValue = "MET" | "NEEDS_WORK" | "NA" | "DONT_KNOW";

export const NP_ANSWER_LABEL: Record<NpAnswerValue, string> = {
  MET: "Met",
  NEEDS_WORK: "Needs Work",
  NA: "N/A",
  DONT_KNOW: "Don’t Know",
};

/** Hex for Recharts / exports. */
export const NP_ANSWER_CHART_COLOR: Record<NpAnswerValue, string> = {
  MET: "#16a34a",
  NEEDS_WORK: "#dc2626",
  DONT_KNOW: "#d97706",
  NA: "#7c9cb8",
};

/** Tailwind utility classes for pills, legends, table chips. */
export const NP_ANSWER_STYLE: Record<
  NpAnswerValue,
  { chip: string; bar: string; text: string }
> = {
  MET: {
    chip: "bg-emerald-100 text-emerald-950 ring-emerald-300/80",
    bar: "bg-emerald-600",
    text: "text-emerald-900",
  },
  NEEDS_WORK: {
    chip: "bg-red-100 text-red-950 ring-red-300/80",
    bar: "bg-red-600",
    text: "text-red-900",
  },
  DONT_KNOW: {
    chip: "bg-amber-100 text-amber-950 ring-amber-300/80",
    bar: "bg-amber-500",
    text: "text-amber-900",
  },
  NA: {
    chip: "bg-slate-200 text-slate-800 ring-slate-400/70",
    bar: "bg-slate-500",
    text: "text-slate-700",
  },
};

export function isFlaggedAnswer(a: NpAnswerValue): boolean {
  return a !== "MET";
}

export function isNaReviewAnswer(a: NpAnswerValue): boolean {
  return a === "NA";
}

export function isRiskStyleAnswer(a: NpAnswerValue): boolean {
  return a === "NEEDS_WORK" || a === "DONT_KNOW";
}
