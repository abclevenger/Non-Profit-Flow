"use client";

import type { BoardMeeting } from "@/lib/mock-data/types";
import { calendarMonthKeys, meetingsOnDateKey } from "@/lib/meeting-workflow/meetingWorkflowHelpers";

export function SimpleMeetingCalendar({
  meetings,
  year,
  monthIndex,
}: {
  meetings: BoardMeeting[];
  year: number;
  monthIndex: number;
}) {
  const days = calendarMonthKeys(year, monthIndex);
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const blanks = Array.from({ length: firstDow }, (_, i) => (
    <div key={`b-${i}`} className="min-h-[2.5rem]" />
  ));
  const monthName = new Date(year, monthIndex, 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/50 p-5 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
      <p className="text-center font-serif text-lg font-semibold text-stone-900">{monthName}</p>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {blanks}
        {days.map((d) => {
          const onDay = meetingsOnDateKey(meetings, d.dateKey);
          return (
            <div
              key={d.dateKey}
              className={`flex min-h-[2.5rem] flex-col items-center justify-start rounded-lg py-1 text-sm ${
                onDay.length ? "bg-stone-900/90 font-semibold text-white" : "text-stone-600"
              }`}
            >
              {d.label}
              {onDay.length ? <span className="mt-0.5 h-1 w-1 rounded-full bg-white/90" /> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-stone-500">Dots mark days with a meeting in this demo.</p>
    </div>
  );
}
