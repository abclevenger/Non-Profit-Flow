"use client";

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
import type { AgencyReportsRollup } from "@/lib/agency-dashboard/types";
import { AgencySummaryCard } from "@/components/agency-dashboard/AgencySummaryCard";

const COLORS = ["#5c5347", "#5a7d6a", "#3d5a80", "#6b4f4f", "#7c6f64", "#4a5d8f", "#8b7355", "#6b7280"];

export function AgencyReportsCharts({ rollup }: { rollup: AgencyReportsRollup }) {
  const barData = rollup.consultByCategory.map((c) => ({ name: c.category.slice(0, 18), full: c.category, count: c.count }));
  const pieData = rollup.consultByCategory.slice(0, 6).map((c) => ({ name: c.category.slice(0, 24), value: c.count }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AgencySummaryCard
          label="Avg board health"
          value={rollup.avgHealthScore != null ? `${rollup.avgHealthScore}%` : "—"}
          hint="From latest completed assessments"
        />
        <AgencySummaryCard
          label="Assessment completion rate"
          value={`${rollup.assessmentCompletionRate}%`}
          hint="Submitted or completed / total runs"
          accent="emerald"
        />
        <AgencySummaryCard label="Critical organizations" value={rollup.criticalOrgCount} accent="rose" />
        <AgencySummaryCard label="Flagged responses" value={rollup.totalFlaggedResponses} accent="amber" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <h3 className="px-2 font-serif text-base font-semibold text-stone-900">Consult flags by category</h3>
          <div className="mt-4 h-72">
            {barData.length === 0 ? (
              <p className="py-16 text-center text-sm text-stone-500">No flagged items to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => {
                      const n = typeof value === "number" ? value : Number(value) || 0;
                      return [n, "Flags"];
                    }}
                    labelFormatter={(_, p) => String((p?.[0]?.payload as { full?: string })?.full ?? "")}
                  />
                  <Bar dataKey="count" fill="#5c5347" radius={[6, 6, 0, 0]} name="Flags" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <h3 className="px-2 font-serif text-base font-semibold text-stone-900">Category mix (donut)</h3>
          <div className="mt-4 h-72">
            {pieData.length === 0 ? (
              <p className="py-16 text-center text-sm text-stone-500">No distribution yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
