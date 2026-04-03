"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NpAnswerValue } from "@/lib/np-assessment/answers";
import { NP_ANSWER_CHART_COLOR, NP_ANSWER_LABEL, NP_ANSWER_STYLE } from "@/lib/np-assessment/answers";
import type { AiSummaryPayload, NpAssessmentReportModel } from "@/lib/np-assessment/scoring";
import { NpAssessmentAiPanel } from "./NpAssessmentAiPanel";
import { NpAssessmentConsultCta } from "./NpAssessmentConsultCta";

function shortName(name: string, max = 22) {
  return name.length <= max ? name : `${name.slice(0, max - 1)}…`;
}

const CHART_ORDER: NpAnswerValue[] = ["MET", "NEEDS_WORK", "DONT_KNOW", "NA"];

export function NpAssessmentReportView({
  report,
  aiPayload,
}: {
  report: NpAssessmentReportModel;
  aiPayload: AiSummaryPayload;
}) {
  const hasFlagged = report.overall.flagged > 0;

  const stackedData = report.categoryBlocks.map((c) => ({
    name: shortName(c.name),
    fullName: c.name,
    Met: c.met,
    "Needs Work": c.needsWork,
    "Don’t Know": c.dontKnow,
    "N/A": c.na,
  }));

  const dist = report.categoryBlocks.reduce(
    (acc, c) => ({
      met: acc.met + c.met,
      needsWork: acc.needsWork + c.needsWork,
      dontKnow: acc.dontKnow + c.dontKnow,
      na: acc.na + c.na,
    }),
    { met: 0, needsWork: 0, dontKnow: 0, na: 0 },
  );

  const donutData = [
    { key: "MET" as const, name: NP_ANSWER_LABEL.MET, value: dist.met, color: NP_ANSWER_CHART_COLOR.MET },
    {
      key: "NEEDS_WORK" as const,
      name: NP_ANSWER_LABEL.NEEDS_WORK,
      value: dist.needsWork,
      color: NP_ANSWER_CHART_COLOR.NEEDS_WORK,
    },
    {
      key: "DONT_KNOW" as const,
      name: NP_ANSWER_LABEL.DONT_KNOW,
      value: dist.dontKnow,
      color: NP_ANSWER_CHART_COLOR.DONT_KNOW,
    },
    { key: "NA" as const, name: NP_ANSWER_LABEL.NA, value: dist.na, color: NP_ANSWER_CHART_COLOR.NA },
  ].filter((d) => d.value > 0);

  const maxRisk = Math.max(1, ...report.categoryBlocks.map((c) => c.weightedRiskScore));

  return (
    <div className={hasFlagged ? "pb-28 lg:pb-8" : ""}>
      <ConsultBanners report={report} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="min-w-0 flex-1 space-y-10">
          <header className="border-b border-stone-200/80 pb-6">
            <h1 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">Organizational assessment report</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Responses use clear color coding:{" "}
              <span className="font-medium text-emerald-700">Met</span>,{" "}
              <span className="font-medium text-red-700">Needs Work</span>,{" "}
              <span className="font-medium text-amber-800">Don’t Know</span>,{" "}
              <span className="font-medium text-slate-600">N/A</span> (review / not applicable).
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total Met" value={String(report.overall.met)} accent="emerald" />
            <SummaryCard label="Total flagged" value={String(report.overall.flagged)} accent="stone" />
            <SummaryCard label="Essential risks" value={String(report.essentialFlaggedCount)} accent="red" />
            <SummaryCard label="Categories w/ consult" value={String(report.categoriesNeedingConsult)} accent="amber" />
          </section>

          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">Category mix</h2>
            <p className="mt-1 text-sm text-stone-600">Stacked counts per category</p>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200/80" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#57534e" }} interval={0} angle={-18} textAnchor="end" height={64} />
                  <YAxis tick={{ fontSize: 11, fill: "#57534e" }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as { fullName?: string };
                      return (
                        <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-semibold text-stone-900">{row.fullName}</p>
                          <ul className="mt-1 space-y-0.5">
                            {payload.map((p) => (
                              <li key={String(p.name)} className="flex justify-between gap-4">
                                <span style={{ color: p.color }}>{p.name}</span>
                                <span className="font-medium">{p.value as number}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Met" stackId="a" fill={NP_ANSWER_CHART_COLOR.MET} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Needs Work" stackId="a" fill={NP_ANSWER_CHART_COLOR.NEEDS_WORK} />
                  <Bar dataKey="Don’t Know" stackId="a" fill={NP_ANSWER_CHART_COLOR.DONT_KNOW} />
                  <Bar dataKey="N/A" stackId="a" fill={NP_ANSWER_CHART_COLOR.NA} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 flex flex-wrap gap-3 text-xs">
              {CHART_ORDER.map((k) => (
                <li key={k} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: NP_ANSWER_CHART_COLOR[k] }} />
                  <span className="text-stone-600">{NP_ANSWER_LABEL[k]}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
              <h2 className="font-serif text-lg font-semibold text-stone-900">Answer distribution</h2>
              <div className="mt-4 h-56">
                {donutData.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-stone-500">No responses yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {donutData.map((e) => (
                          <Cell key={e.key} fill={e.color} stroke="#fff" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [typeof v === "number" ? v : 0, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
              <h2 className="font-serif text-lg font-semibold text-stone-900">Weighted risk by category</h2>
              <p className="mt-1 text-xs text-stone-500">Darker = higher Essential-weighted risk (Needs Work / Don’t Know)</p>
              <div className="mt-4 space-y-2">
                {report.categoryBlocks.map((c) => {
                  const intensity = c.weightedRiskScore / maxRisk;
                  const bg = `color-mix(in srgb, rgb(185 28 28) ${Math.round(intensity * 85)}%, rgb(245 245 244))`;
                  return (
                    <div key={c.slug} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 truncate text-xs text-stone-600" title={c.name}>
                        {shortName(c.name, 16)}
                      </span>
                      <div
                        className="h-8 min-w-0 flex-1 rounded-lg border border-stone-200/80 px-2 py-1 text-xs font-semibold text-stone-900"
                        style={{ backgroundColor: bg }}
                      >
                        <span className="opacity-90">Risk score {c.weightedRiskScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="print:break-inside-avoid rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">Executive summary</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone-700">
              <li>
                Overall: <strong>{report.overall.percentMet}%</strong> Met · <strong>{report.overall.percentFlagged}%</strong> flagged
                (including N/A).
              </li>
              <li>Weighted risk index (Essential-weighted): {report.overall.weightedRiskTotal}</li>
              <li>
                Highest-risk categories:{" "}
                {[...report.categoryBlocks]
                  .sort((a, b) => b.weightedRiskScore - a.weightedRiskScore)
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join("; ") || "—"}
              </li>
              <li>
                Flagged Essential items: {report.essentialFlaggedCount} — review the priority table below (N/A shown separately in
                rankings).
              </li>
            </ul>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
            <h2 className="border-b border-stone-100 px-5 py-4 font-serif text-lg font-semibold text-stone-900">
              Priority actions
            </h2>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/90 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="min-w-[200px] px-4 py-3">Question</th>
                  <th className="px-4 py-3">E/R/A</th>
                  <th className="px-4 py-3">Response</th>
                  <th className="px-4 py-3">Consult</th>
                </tr>
              </thead>
              <tbody>
                {report.priorityRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                      No flagged items — everything is Met or the assessment is incomplete.
                    </td>
                  </tr>
                ) : (
                  report.priorityRows.map((row) => {
                    const st = NP_ANSWER_STYLE[row.response];
                    return (
                      <tr key={`${row.indicatorCode}-${row.priorityRank}`} className="border-b border-stone-100/90">
                        <td className="px-4 py-3 font-medium text-stone-800">{row.priorityRank}</td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-stone-700" title={row.categoryName}>
                          {row.categoryName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-stone-600">{row.indicatorCode}</td>
                        <td className="max-w-xs px-4 py-3 text-xs text-stone-700" title={row.questionText}>
                          {row.questionText.length > 120 ? `${row.questionText.slice(0, 118)}…` : row.questionText}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-800">
                            {row.rating}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${st.chip}`}>
                            {NP_ANSWER_LABEL[row.response]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-700">{row.consultRequired ? "Yes" : "No"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>

          <p className="text-center text-sm text-stone-500 print:hidden">
            <Link href="/overview" className="font-medium text-stone-800 underline-offset-4 hover:underline">
              Back to overview
            </Link>
          </p>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-80 lg:self-start">
          {hasFlagged ? <NpAssessmentConsultCta variant="sidebar" /> : null}
          <NpAssessmentAiPanel payload={aiPayload} />
        </aside>
      </div>

      {hasFlagged ? (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden">
          <NpAssessmentConsultCta variant="mobile_bar" />
        </div>
      ) : null}
    </div>
  );
}

function ConsultBanners({ report }: { report: NpAssessmentReportModel }) {
  if (report.consultBanner === "none") return null;
  const b = report.consultBanner;
  if (b === "urgent_category") {
    return (
      <div
        className="rounded-xl border border-red-300/90 px-4 py-3 text-sm font-medium text-red-950 shadow-sm print:hidden"
        style={{ background: "color-mix(in srgb, rgb(254 202 202) 55%, white)" }}
        role="status"
      >
        <strong>Urgent category review recommended</strong> — one or more assessment sections have at least two flagged Essential
        items. Treat as highest priority alongside legal counsel as appropriate.
      </div>
    );
  }
  if (b === "organization_wide") {
    return (
      <div
        className="rounded-xl border border-violet-300/90 px-4 py-3 text-sm font-medium text-violet-950 shadow-sm print:hidden"
        style={{ background: "color-mix(in srgb, rgb(221 214 254) 45%, white)" }}
        role="status"
      >
        <strong>Organization-wide review recommended</strong> — multiple practice areas are flagged. Consider a cross-functional
        governance retreat and advisor-supported prioritization.
      </div>
    );
  }
  if (b === "priority") {
    return (
      <div
        className="rounded-xl border border-amber-300/90 px-4 py-3 text-sm font-medium text-amber-950 shadow-sm print:hidden"
        style={{ background: "color-mix(in srgb, rgb(253 230 138) 40%, white)" }}
        role="status"
      >
        <strong>Priority consult recommended</strong> — at least one Essential practice is not Met. Address before lower-priority
        improvements.
      </div>
    );
  }
  return (
    <div
      className="rounded-xl border border-sky-200/90 bg-sky-50/90 px-4 py-3 text-sm font-medium text-sky-950 shadow-sm ring-1 ring-sky-100 print:hidden"
      role="status"
    >
      <strong>Consult recommended</strong> — some practices are not marked Met (including N/A items that still need review).
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "stone" | "red" | "amber";
}) {
  const ring =
    accent === "emerald"
      ? "ring-emerald-200/80"
      : accent === "red"
        ? "ring-red-200/80"
        : accent === "amber"
          ? "ring-amber-200/80"
          : "ring-stone-200/80";
  return (
    <div className={`rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm ring-1 ${ring}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
