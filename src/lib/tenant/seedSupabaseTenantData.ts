/**
 * Pushes bundled profile JSON into Supabase tenant tables for a Prisma `Organization.id`.
 * Used by Prisma seed and platform-admin reset API. Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
 */
import { createClient } from "@supabase/supabase-js";
import type { OrganizationProfile } from "@/lib/mock-data/types";
import { communityNonprofitProfile } from "@/lib/mock-data/profiles/communityNonprofit";
import { growingNonprofitProfile } from "@/lib/mock-data/profiles/growingNonprofit";
import { privateSchoolProfile } from "@/lib/mock-data/profiles/privateSchool";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function profileForDemoKey(demoProfileKey: string | null | undefined): OrganizationProfile {
  if (demoProfileKey === "growingNonprofit") return growingNonprofitProfile;
  if (demoProfileKey === "privateSchool") return privateSchoolProfile;
  return communityNonprofitProfile;
}

/**
 * Full tenant seed / reset for one organization (truncates per-table child rows for that org).
 */
export async function seedSupabaseTenantFromProfile(
  organizationId: string,
  isDemo: boolean,
  profile: OrganizationProfile,
  options?: { demoEditingEnabled?: boolean; demoSeedVersion?: number },
) {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const p = profile;
  const demoEditingEnabled = options?.demoEditingEnabled ?? false;
  const demoSeedVersion = options?.demoSeedVersion ?? 1;

  const { error: orgErr } = await sb.from("tenant_organizations").upsert(
    {
      id: organizationId,
      is_demo: isDemo,
      demo_editing_enabled: demoEditingEnabled,
      demo_seed_version: demoSeedVersion,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (orgErr) throw new Error(`tenant_organizations: ${orgErr.message}`);

  const { error: ovErr } = await sb.from("tenant_org_overlays").upsert(
    {
      organization_id: organizationId,
      reporting_period: p.reportingPeriod,
      board_chair: p.boardChair,
      executive_director: p.executiveDirector,
      strategic_alignment_notes: p.strategicAlignmentNotes ?? null,
      governance_notes: p.governanceNotes ?? null,
      meeting_prep_notes: p.meetingPrepNotes ?? null,
      executive_update: p.executiveUpdate,
      board_agenda: p.boardAgenda,
      board_training: p.boardTraining,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );
  if (ovErr) throw new Error(`tenant_org_overlays: ${ovErr.message}`);

  await sb.from("tenant_strategic_priorities").delete().eq("organization_id", organizationId);
  const spRows = p.strategicPriorities.map((x, i) => ({
    organization_id: organizationId,
    title: x.title,
    description: x.description,
    owner: x.owner,
    progress: x.progress,
    status: x.status,
    next_milestone: x.nextMilestone,
    due_date: x.dueDate,
    last_updated: x.lastUpdated,
    notes: x.notes,
    category: x.category ?? null,
    display_order: i,
  }));
  const { error: spErr } = await sb.from("tenant_strategic_priorities").insert(spRows);
  if (spErr) throw new Error(`tenant_strategic_priorities: ${spErr.message}`);

  await sb.from("tenant_risk_items").delete().eq("organization_id", organizationId);
  const rRows = p.risks.map((x, i) => ({
    organization_id: organizationId,
    category: x.category,
    status: x.status,
    summary: x.summary,
    owner: x.owner ?? null,
    watchlist: x.watchlist ?? false,
    trend: x.trend ?? null,
    display_order: i,
  }));
  const { error: rErr } = await sb.from("tenant_risk_items").insert(rRows);
  if (rErr) throw new Error(`tenant_risk_items: ${rErr.message}`);

  await sb.from("tenant_governance_items").delete().eq("organization_id", organizationId);
  const gRows = p.governance.map((x, i) => ({
    organization_id: organizationId,
    label: x.label,
    status: x.status,
    detail: x.detail ?? null,
    display_order: i,
  }));
  const { error: gErr } = await sb.from("tenant_governance_items").insert(gRows);
  if (gErr) throw new Error(`tenant_governance_items: ${gErr.message}`);

  await sb.from("tenant_action_items").delete().eq("organization_id", organizationId);
  const aRows = p.actionItems.map((x, i) => ({
    id: x.id,
    organization_id: organizationId,
    task: x.task,
    owner: x.owner,
    due_date: x.dueDate,
    status: x.status,
    overdue: x.overdue,
    linked_meeting_id: x.linkedMeetingId ?? null,
    linked_vote_id: x.linkedVoteId ?? null,
    display_order: i,
  }));
  const { error: aErr } = await sb.from("tenant_action_items").insert(aRows);
  if (aErr) throw new Error(`tenant_action_items: ${aErr.message}`);

  await sb.from("tenant_document_items").delete().eq("organization_id", organizationId);
  const dRows = p.documents.map((x, i) => ({
    organization_id: organizationId,
    title: x.title,
    type: x.type,
    last_updated: x.lastUpdated,
    href: x.href,
    category: x.category,
    download_allowed: x.downloadAllowed ?? true,
    display_order: i,
  }));
  const { error: dErr } = await sb.from("tenant_document_items").insert(dRows);
  if (dErr) throw new Error(`tenant_document_items: ${dErr.message}`);

  await sb.from("tenant_key_metrics").delete().eq("organization_id", organizationId);
  const kRows = p.keyMetrics.map((x, i) => ({
    organization_id: organizationId,
    label: x.label,
    value: x.value,
    sublabel: x.sublabel ?? null,
    trend: x.trend ?? null,
    tone: x.tone ?? null,
    display_order: i,
  }));
  const { error: kErr } = await sb.from("tenant_key_metrics").insert(kRows);
  if (kErr) throw new Error(`tenant_key_metrics: ${kErr.message}`);

  await sb.from("tenant_compliance_events").delete().eq("organization_id", organizationId);
  if (p.complianceCalendar?.length) {
    const cRows = p.complianceCalendar.map((x, i) => ({
      organization_id: organizationId,
      label: x.label,
      event_date: x.date,
      status: x.status,
      display_order: i,
    }));
    const { error: cErr } = await sb.from("tenant_compliance_events").insert(cRows);
    if (cErr) throw new Error(`tenant_compliance_events: ${cErr.message}`);
  }

  await sb.from("tenant_board_insights").delete().eq("organization_id", organizationId);
  const topRisk = p.risks[0];
  const insightRows = [
    {
      organization_id: organizationId,
      title: "Board health snapshot",
      description: p.governanceNotes?.trim()
        ? p.governanceNotes
        : "Review standing committees and compliance calendar items before the next full board meeting.",
      href: "/governance",
      tone: "neutral",
      display_order: 0,
    },
    ...(topRisk
      ? [
          {
            organization_id: organizationId,
            title: `Risk watch: ${topRisk.category}`,
            description: topRisk.summary,
            href: "/risks",
            tone: topRisk.status === "High" ? ("negative" as const) : ("neutral" as const),
            display_order: 1,
          },
        ]
      : []),
    {
      organization_id: organizationId,
      title: "Strategic priorities",
      description: `Tracking ${p.strategicPriorities.length} active priorities — open Strategy for full detail.`,
      href: "/strategy",
      tone: "positive",
      display_order: 2,
    },
  ];
  const { error: biErr } = await sb.from("tenant_board_insights").insert(insightRows);
  if (biErr) throw new Error(`tenant_board_insights: ${biErr.message}`);

  await sb.from("tenant_board_meetings").delete().eq("organization_id", organizationId);
  const bmRows = p.boardMeetings.map((x, i) => ({
    id: x.id,
    organization_id: organizationId,
    payload: x,
    display_order: i,
  }));
  const { error: bmErr } = await sb.from("tenant_board_meetings").insert(bmRows);
  if (bmErr) throw new Error(`tenant_board_meetings: ${bmErr.message}`);

  await sb.from("tenant_vote_items").delete().eq("organization_id", organizationId);
  const vRows = p.boardVotes.map((x, i) => ({
    id: x.id,
    organization_id: organizationId,
    payload: x,
    display_order: i,
  }));
  const { error: vErr } = await sb.from("tenant_vote_items").insert(vRows);
  if (vErr) throw new Error(`tenant_vote_items: ${vErr.message}`);

  await sb.from("tenant_meeting_minutes").delete().eq("organization_id", organizationId);
  const mRows = p.meetingMinutes.map((x, i) => ({
    id: x.id,
    organization_id: organizationId,
    payload: x,
    display_order: i,
  }));
  const { error: mErr } = await sb.from("tenant_meeting_minutes").insert(mRows);
  if (mErr) throw new Error(`tenant_meeting_minutes: ${mErr.message}`);

  console.log(`Supabase tenant seed OK for org ${organizationId}`);
}

/** @deprecated Use `seedSupabaseTenantFromProfile` or pass `demoProfileKey` explicitly. */
export async function seedSupabaseTenantForOrganization(organizationId: string, isDemo: boolean) {
  await seedSupabaseTenantFromProfile(organizationId, isDemo, communityNonprofitProfile);
}

export async function seedSupabaseTenantForDemoOrg(
  organizationId: string,
  demoProfileKey: string | null | undefined,
  isDemo: boolean,
  options?: { demoEditingEnabled?: boolean },
) {
  await seedSupabaseTenantFromProfile(organizationId, isDemo, profileForDemoKey(demoProfileKey), options);
}
