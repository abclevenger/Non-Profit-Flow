import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export type TenantOrgOverlayRow = {
  organization_id: string;
  reporting_period: string | null;
  board_chair: string | null;
  executive_director: string | null;
  strategic_alignment_notes: string | null;
  governance_notes: string | null;
  meeting_prep_notes: string | null;
  executive_update: unknown;
  board_agenda: unknown;
  board_training: unknown;
};

export type TenantSnapshot = {
  overlay: TenantOrgOverlayRow | null;
  strategicPriorities: Record<string, unknown>[];
  risks: Record<string, unknown>[];
  governance: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  keyMetrics: Record<string, unknown>[];
  compliance: Record<string, unknown>[];
  insights: Record<string, unknown>[];
  boardMeetings: { id: string; payload: unknown }[];
  votes: { id: string; payload: unknown }[];
  minutes: { id: string; payload: unknown }[];
};

async function fromTable<T>(
  sb: SupabaseClient,
  table: string,
  orgId: string,
  orderCol = "display_order",
): Promise<T[]> {
  const { data, error } = await sb.from(table).select("*").eq("organization_id", orgId).order(orderCol, { ascending: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

/**
 * Loads normalized tenant rows for one organization (service role — call only after Prisma membership check).
 */
export async function fetchTenantSnapshot(organizationId: string): Promise<TenantSnapshot> {
  const sb = createServiceRoleSupabaseClient("lib/tenant/fetchTenantSnapshot");

  const [
    overlayRes,
    strategicPriorities,
    risks,
    governance,
    actions,
    documents,
    keyMetrics,
    compliance,
    insights,
    boardMeetings,
    votes,
    minutes,
  ] = await Promise.all([
    sb.from("tenant_org_overlays").select("*").eq("organization_id", organizationId).maybeSingle(),
    fromTable<Record<string, unknown>>(sb, "tenant_strategic_priorities", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_risk_items", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_governance_items", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_action_items", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_document_items", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_key_metrics", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_compliance_events", organizationId),
    fromTable<Record<string, unknown>>(sb, "tenant_board_insights", organizationId),
    sb
      .from("tenant_board_meetings")
      .select("id,payload")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw new Error(`tenant_board_meetings: ${error.message}`);
        return (data ?? []) as { id: string; payload: unknown }[];
      }),
    sb
      .from("tenant_vote_items")
      .select("id,payload")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw new Error(`tenant_vote_items: ${error.message}`);
        return (data ?? []) as { id: string; payload: unknown }[];
      }),
    sb
      .from("tenant_meeting_minutes")
      .select("id,payload")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw new Error(`tenant_meeting_minutes: ${error.message}`);
        return (data ?? []) as { id: string; payload: unknown }[];
      }),
  ]);

  if (overlayRes.error) {
    throw new Error(`tenant_org_overlays: ${overlayRes.error.message}`);
  }

  return {
    overlay: (overlayRes.data ?? null) as TenantOrgOverlayRow | null,
    strategicPriorities,
    risks,
    governance,
    actions,
    documents,
    keyMetrics,
    compliance,
    insights,
    boardMeetings,
    votes,
    minutes,
  };
}
