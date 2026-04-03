"use client";

import { InsightCallout } from "@/components/dashboard/InsightCallout";
import {
  GovernanceBasicsCard,
  OrientationTimelineCard,
  ProgressTrackerCard,
  QuickAnswersCard,
  ResourceListCard,
  TrainingHeader,
  TrainingModuleList,
  TrainingSummaryCards,
} from "@/components/training";
import { useDemoMode } from "@/lib/demo-mode-context";
import { trainingSummaryStats } from "@/lib/training/trainingHelpers";
import { useMemo } from "react";

export default function TrainingPage() {
  const { profile } = useDemoMode();
  const bundle = profile.boardTraining;
  const stats = useMemo(() => trainingSummaryStats(bundle), [bundle]);

  return (
    <div className="space-y-10">
      <TrainingHeader />
      <InsightCallout title="How coordinators use this">
        Assign required reading, track completion, and keep orientation materials in one place. In production, swap mock
        bundles for per-user progress, acknowledgements, and reminders.
      </InsightCallout>
      <TrainingSummaryCards stats={stats} />

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Orientation overview</h2>
        <p className="text-sm text-stone-600">{bundle.welcomeLead}</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
            <h3 className="font-serif text-lg font-semibold text-stone-900">{bundle.welcomeTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{bundle.missionSnapshot}</p>
          </div>
          <OrientationTimelineCard steps={bundle.orientationTimeline} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Training modules</h2>
        <p className="text-sm text-stone-600">Core topics every new member should see, plus optional deep dives.</p>
        <TrainingModuleList modules={bundle.modules} />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Governance basics & quick answers</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <GovernanceBasicsCard points={bundle.governanceBasics} />
          <QuickAnswersCard items={bundle.quickAnswers} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Resources</h2>
        <ResourceListCard resources={bundle.resources} />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Progress</h2>
        <ProgressTrackerCard bundle={bundle} />
      </section>

      <InsightCallout>
        <span className="font-medium text-stone-800">Sample board onboarding and training experience.</span> Content is
        illustrative; connect to your policy library, LMS, or intranet when you go live.
      </InsightCallout>
    </div>
  );
}
