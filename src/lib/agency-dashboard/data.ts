import { prisma } from "@/lib/prisma";
import type {
  AgencyAccountRow,
  AgencyActivityItem,
  AgencyConsultPipelineRow,
  AgencyConsultRow,
  AgencyNonprofitAccountDetail,
  AgencyOverviewStats,
  AgencyReportsRollup,
  AgencyTeamMemberRow,
  AgencyHealthTier,
} from "@/lib/agency-dashboard/types";

function tierFromHealth(score: number | null, consultNeeded: boolean, essentialFlags: number): AgencyHealthTier {
  if (score !== null && score < 50) return "critical";
  if (essentialFlags >= 2 || (score !== null && score < 72)) return "at_risk";
  if (consultNeeded && (score === null || score < 85)) return "at_risk";
  return "healthy";
}

async function healthForAssessment(assessmentId: string): Promise<{
  score: number | null;
  essentialFlags: number;
  flaggedCount: number;
}> {
  const responses = await prisma.npAssessmentResponse.findMany({
    where: { assessmentId },
    include: { question: { select: { ratingType: true } } },
  });
  if (responses.length === 0) return { score: null, essentialFlags: 0, flaggedCount: 0 };
  const scored = responses.filter((r) => r.answer === "MET" || r.answer === "NEEDS_WORK" || r.answer === "NA");
  if (scored.length === 0) return { score: null, essentialFlags: 0, flaggedCount: 0 };
  const met = responses.filter((r) => r.answer === "MET").length;
  const score = Math.round((met / scored.length) * 100);
  const essentialFlags = responses.filter(
    (r) => r.flaggedForConsult && r.question.ratingType === "E",
  ).length;
  const flaggedCount = responses.filter((r) => r.flaggedForConsult).length;
  return { score, essentialFlags, flaggedCount };
}

export async function getOrganizationIdsForAgency(agencyId: string): Promise<string[]> {
  const rows = await prisma.organization.findMany({
    where: { agencyId },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function loadAgencyAccounts(agencyId: string): Promise<AgencyAccountRow[]> {
  const orgs = await prisma.organization.findMany({
    where: { agencyId },
    orderBy: { name: "asc" },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
      npAssessments: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true, status: true, updatedAt: true },
      },
      gcReviews: {
        where: { status: "PENDING" },
        select: { id: true },
      },
    },
  });

  const rows: AgencyAccountRow[] = [];

  for (const o of orgs) {
    const latest = o.npAssessments[0] ?? null;
    let healthScore: number | null = null;
    let essentialFlags = 0;
    let openConsultFromAssessment = 0;
    if (
      latest &&
      (latest.status === "COMPLETED" || latest.status === "SUBMITTED" || latest.status === "IN_PROGRESS")
    ) {
      const h = await healthForAssessment(latest.id);
      if (latest.status === "COMPLETED" || latest.status === "SUBMITTED") {
        healthScore = h.score;
      }
      essentialFlags = h.essentialFlags;
      openConsultFromAssessment = h.flaggedCount;
    }

    const advisor = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: o.id,
        status: "ACTIVE",
        role: "ATTORNEY_ADVISOR",
      },
      include: { user: { select: { name: true, email: true } } },
    });
    const assignedAdvisorLabel = advisor
      ? [advisor.title?.trim(), advisor.user.name || advisor.user.email].filter(Boolean).join(" · ") || null
      : null;

    const openConsultCount = o.gcReviews.length + openConsultFromAssessment;
    const consultNeeded = openConsultCount > 0 || essentialFlags > 0;
    const healthTier = tierFromHealth(healthScore, consultNeeded, essentialFlags);

    const lastUpdatedAt = new Date(
      Math.max(o.updatedAt.getTime(), latest?.updatedAt.getTime() ?? 0),
    );

    rows.push({
      organizationId: o.id,
      name: o.name,
      slug: o.slug,
      isDemoTenant: o.isDemoTenant,
      onboardingStatus: o.onboardingStatus,
      memberCount: o.memberships.length,
      latestAssessmentId: latest?.id ?? null,
      latestAssessmentStatus: latest?.status ?? null,
      latestAssessmentUpdatedAt: latest?.updatedAt ?? null,
      healthScore,
      healthTier,
      consultNeeded,
      openConsultCount,
      assignedAdvisorLabel,
      lastUpdatedAt,
    });
  }

  return rows;
}

export async function loadAgencyOverviewStats(
  agencyId: string,
  accounts: AgencyAccountRow[],
): Promise<AgencyOverviewStats> {
  const nonprofitCount = accounts.length;
  const activeTeamMembersAcrossOrgs = await prisma.organizationMembership.count({
    where: {
      status: "ACTIVE",
      organization: { agencyId },
    },
  });

  const [agencyRow, agencyMembers] = await Promise.all([
    prisma.agency.findUnique({
      where: { id: agencyId },
      select: { ownerUserId: true },
    }),
    prisma.agencyMember.findMany({
      where: { agencyId, status: "ACTIVE" },
      select: { userId: true },
    }),
  ]);
  const agencyTeamIds = new Set(agencyMembers.map((m) => m.userId));
  if (agencyRow) agencyTeamIds.add(agencyRow.ownerUserId);
  const agencyTeamCount = agencyTeamIds.size;

  const orgIds = accounts.map((a) => a.organizationId);
  let openConsultFlags = 0;
  let completedAssessmentsCount = 0;
  if (orgIds.length > 0) {
    const [gc, resp] = await Promise.all([
      prisma.gcReviewRequest.count({
        where: { organizationId: { in: orgIds }, status: "PENDING" },
      }),
      prisma.npAssessmentResponse.count({
        where: {
          flaggedForConsult: true,
          assessment: { organizationId: { in: orgIds } },
        },
      }),
    ]);
    openConsultFlags = gc + resp;
    completedAssessmentsCount = await prisma.npAssessment.count({
      where: {
        organizationId: { in: orgIds },
        OR: [{ status: "COMPLETED" }, { status: "SUBMITTED" }],
      },
    });
  }

  const accountsNeedingReview = accounts.filter(
    (a) => a.healthTier !== "healthy" || a.consultNeeded,
  ).length;

  const healthyCount = accounts.filter((a) => a.healthTier === "healthy").length;
  const atRiskCount = accounts.filter((a) => a.healthTier === "at_risk").length;
  const criticalCount = accounts.filter((a) => a.healthTier === "critical").length;

  const essentialFlagsCount =
    orgIds.length === 0
      ? 0
      : await prisma.npAssessmentResponse.count({
          where: {
            flaggedForConsult: true,
            question: { ratingType: "E" },
            assessment: { organizationId: { in: orgIds } },
          },
        });

  return {
    nonprofitCount,
    activeTeamMembersAcrossOrgs,
    agencyTeamCount,
    openConsultFlags,
    completedAssessmentsCount,
    accountsNeedingReview,
    healthyCount,
    atRiskCount,
    criticalCount,
    essentialFlagsCount,
  };
}

export async function loadAgencyActivity(agencyId: string, limit = 12): Promise<AgencyActivityItem[]> {
  const orgIds = await getOrganizationIdsForAgency(agencyId);
  if (orgIds.length === 0) return [];

  const orgMap = Object.fromEntries(
    (await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })).map((o) => [o.id, o.name]),
  );

  const [assessments, gcRows, expertRows, logs] = await Promise.all([
    prisma.npAssessment.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        organizationId: true,
        status: true,
        updatedAt: true,
        submittedAt: true,
        title: true,
      },
    }),
    prisma.gcReviewRequest.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { flaggedAt: "desc" },
      take: 6,
      select: {
        id: true,
        organizationId: true,
        itemTitle: true,
        status: true,
        flaggedAt: true,
        urgency: true,
      },
    }),
    prisma.expertReviewRequest.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        organizationId: true,
        subject: true,
        category: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.contentAccessLog.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        organizationId: true,
        resourceType: true,
        resourceKey: true,
        href: true,
        createdAt: true,
      },
    }),
  ]);

  const items: AgencyActivityItem[] = [];

  for (const a of assessments) {
    const name = orgMap[a.organizationId] ?? "Account";
    if (a.status === "COMPLETED" || a.status === "SUBMITTED") {
      items.push({
        id: `as-${a.id}`,
        type: "assessment_submitted",
        title: "Assessment submitted",
        detail: a.title,
        organizationId: a.organizationId,
        organizationName: name,
        occurredAt: a.submittedAt ?? a.updatedAt,
        href: `/assessment/report?assessmentId=${a.id}`,
      });
    } else {
      items.push({
        id: `as-${a.id}-p`,
        type: "assessment_progress",
        title: "Assessment updated",
        detail: a.title,
        organizationId: a.organizationId,
        organizationName: name,
        occurredAt: a.updatedAt,
        href: `/assessment/take/${a.id}`,
      });
    }
  }

  for (const g of gcRows) {
    items.push({
      id: `gc-${g.id}`,
      type: "gc_review",
      title: "GC review",
      detail: g.itemTitle,
      organizationId: g.organizationId,
      organizationName: orgMap[g.organizationId] ?? "Account",
      occurredAt: g.flaggedAt,
      href: `/general-counsel`,
    });
  }

  for (const e of expertRows) {
    items.push({
      id: `ex-${e.id}`,
      type: "expert_review",
      title: "Expert review request",
      detail: e.subject,
      organizationId: e.organizationId,
      organizationName: orgMap[e.organizationId] ?? "Account",
      occurredAt: e.createdAt,
      href: `/reviews`,
    });
  }

  for (const l of logs) {
    if (!l.organizationId) continue;
    items.push({
      id: `log-${l.id}`,
      type: "content_access",
      title: `Resource: ${l.resourceType}`,
      detail: l.resourceKey,
      organizationId: l.organizationId,
      organizationName: orgMap[l.organizationId] ?? "Account",
      occurredAt: l.createdAt,
      href: l.href,
    });
  }

  items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  return items.slice(0, limit);
}

export async function loadAgencyConsultQueue(agencyId: string): Promise<AgencyConsultRow[]> {
  const orgIds = await getOrganizationIdsForAgency(agencyId);
  if (orgIds.length === 0) return [];
  const orgMap = Object.fromEntries(
    (await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })).map((o) => [o.id, o.name]),
  );

  const flagged = await prisma.npAssessmentResponse.findMany({
    where: {
      flaggedForConsult: true,
      assessment: { organizationId: { in: orgIds } },
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
    include: {
      question: { select: { questionText: true, ratingType: true, indicatorCode: true } },
      assessment: { select: { id: true, organizationId: true } },
    },
  });

  const gc = await prisma.gcReviewRequest.findMany({
    where: { organizationId: { in: orgIds } },
    orderBy: { flaggedAt: "desc" },
    take: 80,
  });

  const rows: AgencyConsultRow[] = [];

  for (const r of flagged) {
    rows.push({
      id: `resp-${r.id}`,
      source: "assessment_flag",
      organizationId: r.assessment.organizationId,
      organizationName: orgMap[r.assessment.organizationId] ?? "Account",
      category: r.question.indicatorCode,
      summary: r.question.questionText.slice(0, 160),
      severity: r.flaggedForConsult ? "consult" : "low",
      ratingType: r.question.ratingType,
      status: "new",
      flaggedAt: r.updatedAt,
      itemHref: `/assessment/take/${r.assessment.id}`,
    });
  }

  for (const g of gc) {
    rows.push({
      id: `gc-${g.id}`,
      source: "gc_review",
      organizationId: g.organizationId,
      organizationName: orgMap[g.organizationId] ?? "Account",
      category: g.itemType,
      summary: g.summaryConcern.slice(0, 200),
      severity: g.urgency,
      ratingType: null,
      status: g.status,
      flaggedAt: g.flaggedAt,
      itemHref: `/general-counsel`,
    });
  }

  rows.sort((a, b) => b.flaggedAt.getTime() - a.flaggedAt.getTime());
  return rows;
}

function ratingTypeLabel(ratingType: string | null): string | null {
  if (ratingType === "E") return "Essential";
  if (ratingType === "R") return "Recommended";
  if (ratingType === "A") return "Additional";
  return null;
}

function priorityFromRating(ratingType: string | null, expertPriority?: string | null): "P1" | "P2" | "P3" {
  if (expertPriority === "URGENT") return "P1";
  if (expertPriority === "TIME_SENSITIVE") return "P2";
  if (ratingType === "E") return "P1";
  if (ratingType === "R") return "P2";
  return "P3";
}

function gcPipelineStatus(dbStatus: string): AgencyConsultPipelineRow["pipelineStatus"] {
  if (dbStatus === "COMPLETE") return "resolved";
  if (dbStatus === "PENDING") return "new";
  return "in_review";
}

function expertPipelineStatus(dbStatus: string): AgencyConsultPipelineRow["pipelineStatus"] {
  if (dbStatus === "COMPLETED") return "resolved";
  if (dbStatus === "SUBMITTED" || dbStatus === "ROUTED") return "new";
  return "in_review";
}

async function advisorLabelByOrganizationIds(orgIds: string[]): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  for (const id of orgIds) map.set(id, null);
  if (orgIds.length === 0) return map;
  const rows = await prisma.organizationMembership.findMany({
    where: {
      organizationId: { in: orgIds },
      status: "ACTIVE",
      role: "ATTORNEY_ADVISOR",
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const r of rows) {
    if (map.get(r.organizationId)) continue;
    const label =
      [r.title?.trim(), r.user.name?.trim(), r.user.email].filter(Boolean).join(" · ") || null;
    map.set(r.organizationId, label);
  }
  return map;
}

/**
 * Consult queue across assessment flags, GC reviews, and expert review requests — scoped to agency orgs.
 */
export async function loadAgencyConsultPipeline(agencyId: string): Promise<AgencyConsultPipelineRow[]> {
  const orgIds = await getOrganizationIdsForAgency(agencyId);
  if (orgIds.length === 0) return [];

  const [orgMapEntries, advisorByOrg, flagged, gcRows, expertRows] = await Promise.all([
    prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    }),
    advisorLabelByOrganizationIds(orgIds),
    prisma.npAssessmentResponse.findMany({
      where: {
        flaggedForConsult: true,
        assessment: { organizationId: { in: orgIds } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        question: {
          select: {
            questionText: true,
            ratingType: true,
            indicatorCode: true,
            category: { select: { name: true } },
          },
        },
        assessment: { select: { id: true, organizationId: true } },
      },
    }),
    prisma.gcReviewRequest.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.expertReviewRequest.findMany({
      where: { organizationId: { in: orgIds } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ]);

  const orgName = Object.fromEntries(orgMapEntries.map((o) => [o.id, o.name]));
  const out: AgencyConsultPipelineRow[] = [];

  for (const r of flagged) {
    const oid = r.assessment.organizationId;
    const cat = r.question.category?.name ?? r.question.indicatorCode;
    out.push({
      id: `resp-${r.id}`,
      source: "assessment_flag",
      organizationId: oid,
      organizationName: orgName[oid] ?? "Account",
      categoryLabel: cat,
      issueText: r.question.questionText,
      severity: r.answer === "DONT_KNOW" ? "Knowledge gap" : "Needs work",
      priorityLevel: priorityFromRating(r.question.ratingType),
      ratingType: r.question.ratingType,
      ratingTypeLabel: ratingTypeLabel(r.question.ratingType),
      assignedAdvisorLabel: advisorByOrg.get(oid) ?? null,
      pipelineStatus: "new",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      itemHref: `/assessment/take/${r.assessment.id}`,
    });
  }

  for (const g of gcRows) {
    const oid = g.organizationId;
    out.push({
      id: `gc-${g.id}`,
      source: "gc_review",
      organizationId: oid,
      organizationName: orgName[oid] ?? "Account",
      categoryLabel: g.itemType.replace(/_/g, " "),
      issueText: g.summaryConcern,
      severity: g.urgency.replace(/_/g, " "),
      priorityLevel: g.urgency === "HIGH_RISK" ? "P1" : g.urgency === "TIME_SENSITIVE" ? "P2" : "P3",
      ratingType: null,
      ratingTypeLabel: null,
      assignedAdvisorLabel: advisorByOrg.get(oid) ?? null,
      pipelineStatus: gcPipelineStatus(g.status),
      createdAt: g.flaggedAt,
      updatedAt: g.updatedAt,
      itemHref: "/general-counsel",
    });
  }

  for (const e of expertRows) {
    const oid = e.organizationId;
    out.push({
      id: `expert-${e.id}`,
      source: "expert_review",
      organizationId: oid,
      organizationName: orgName[oid] ?? "Account",
      categoryLabel: e.category,
      issueText: e.summary,
      severity: e.priority,
      priorityLevel: priorityFromRating(null, e.priority),
      ratingType: null,
      ratingTypeLabel: null,
      assignedAdvisorLabel: advisorByOrg.get(oid) ?? null,
      pipelineStatus: expertPipelineStatus(e.status),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      itemHref: e.relatedHref || "/reviews",
    });
  }

  out.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return out;
}

export async function loadAgencyNonprofitAccountDetail(
  agencyId: string,
  organizationId: string,
): Promise<AgencyNonprofitAccountDetail | null> {
  const org = await prisma.organization.findFirst({
    where: { id: organizationId, agencyId },
    select: {
      id: true,
      name: true,
      slug: true,
      missionSnippet: true,
      isDemoTenant: true,
      onboardingStatus: true,
      industryType: true,
    },
  });
  if (!org) return null;

  const latest = await prisma.npAssessment.findFirst({
    where: { organizationId: org.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      title: true,
      updatedAt: true,
      submittedAt: true,
    },
  });

  let healthScore: number | null = null;
  let essentialFlags = 0;
  let flaggedCount = 0;
  if (
    latest &&
    (latest.status === "COMPLETED" || latest.status === "SUBMITTED" || latest.status === "IN_PROGRESS")
  ) {
    const h = await healthForAssessment(latest.id);
    if (latest.status === "COMPLETED" || latest.status === "SUBMITTED") {
      healthScore = h.score;
    }
    essentialFlags = h.essentialFlags;
    flaggedCount = h.flaggedCount;
  }

  const [gcOpen, advisor] = await Promise.all([
    prisma.gcReviewRequest.count({
      where: { organizationId: org.id, status: { not: "COMPLETE" } },
    }),
    prisma.organizationMembership.findFirst({
      where: { organizationId: org.id, status: "ACTIVE", role: "ATTORNEY_ADVISOR" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const openConsultCount = gcOpen + flaggedCount;
  const consultNeeded = openConsultCount > 0 || essentialFlags > 0;
  const tier = tierFromHealth(healthScore, consultNeeded, essentialFlags);

  const assignedAdvisorLabel = advisor
    ? [advisor.title?.trim(), advisor.user.name, advisor.user.email].filter(Boolean).join(" · ") || null
    : null;

  const activity = await loadAgencyActivity(agencyId, 24);
  const recentActivity = activity.filter((a) => a.organizationId === org.id).slice(0, 12);

  const hasSubmittedReport =
    latest != null && (latest.status === "COMPLETED" || latest.status === "SUBMITTED");

  return {
    organization: org,
    latestAssessment: latest,
    boardHealth: {
      score: healthScore,
      tier,
      essentialConsultFlags: essentialFlags,
      openConsultCount,
    },
    assignedAdvisorLabel,
    nextMeeting: null,
    recentActivity,
    quickLinks: {
      latestAssessmentId: latest?.id ?? null,
      hasSubmittedReport,
    },
  };
}

export async function loadAgencyTeam(agencyId: string): Promise<AgencyTeamMemberRow[]> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!agency) return [];

  const profileRows = await prisma.userProfile.findMany({
    where: {
      userId: { in: [agency.owner.id, ...agency.members.map((m) => m.userId)] },
    },
    select: { userId: true, fullName: true },
  });
  const fullNameByUser = Object.fromEntries(profileRows.map((p) => [p.userId, p.fullName]));

  const orgs = await prisma.organization.findMany({
    where: { agencyId },
    select: { id: true, name: true },
  });
  const orgIds = orgs.map((o) => o.id);

  const memberships =
    orgIds.length === 0
      ? []
      : await prisma.organizationMembership.findMany({
          where: { organizationId: { in: orgIds }, status: "ACTIVE" },
          select: { userId: true, organizationId: true },
        });

  const orgName = Object.fromEntries(orgs.map((o) => [o.id, o.name]));

  const byUser = new Map<string, { id: string; name: string }[]>();
  for (const m of memberships) {
    const list = byUser.get(m.userId) ?? [];
    list.push({ id: m.organizationId, name: orgName[m.organizationId] ?? m.organizationId });
    byUser.set(m.userId, list);
  }

  const lastLog = async (userId: string) => {
    const log = await prisma.contentAccessLog.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return log?.createdAt ?? null;
  };

  const rows: AgencyTeamMemberRow[] = [];

  rows.push({
    userId: agency.owner.id,
    name: agency.owner.name,
    fullName: fullNameByUser[agency.owner.id] ?? null,
    email: agency.owner.email,
    agencyRole: "OWNER",
    status: "ACTIVE",
    nonprofits: byUser.get(agency.owner.id) ?? [],
    lastActiveAt: await lastLog(agency.owner.id),
  });

  for (const m of agency.members) {
    if (m.userId === agency.owner.id) continue;
    rows.push({
      userId: m.user.id,
      name: m.user.name,
      fullName: fullNameByUser[m.user.id] ?? null,
      email: m.user.email,
      agencyRole: m.role === "AGENCY_ADMIN" ? "AGENCY_ADMIN" : "AGENCY_STAFF",
      status: m.status,
      nonprofits: byUser.get(m.user.id) ?? [],
      lastActiveAt: await lastLog(m.user.id),
    });
  }

  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.userId)) return false;
    seen.add(r.userId);
    return true;
  });
}

export async function loadAgencyReportsRollup(
  agencyId: string,
  accounts: AgencyAccountRow[],
): Promise<AgencyReportsRollup> {
  const orgIds = accounts.map((a) => a.organizationId);
  const scores = accounts.map((a) => a.healthScore).filter((s): s is number => s !== null);
  const avgHealthScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  let totalAssessments = 0;
  let completed = 0;
  let flagged: { question: { category: { name: string } } }[] = [];
  if (orgIds.length > 0) {
    totalAssessments = await prisma.npAssessment.count({
      where: { organizationId: { in: orgIds } },
    });
    completed = await prisma.npAssessment.count({
      where: {
        organizationId: { in: orgIds },
        OR: [{ status: "COMPLETED" }, { status: "SUBMITTED" }],
      },
    });
    flagged = await prisma.npAssessmentResponse.findMany({
      where: {
        flaggedForConsult: true,
        assessment: { organizationId: { in: orgIds } },
      },
      include: { question: { include: { category: { select: { name: true } } } } },
    });
  }
  const assessmentCompletionRate =
    totalAssessments === 0 ? 0 : Math.round((completed / totalAssessments) * 100);

  const catCount = new Map<string, number>();
  for (const f of flagged) {
    const c = f.question.category.name;
    catCount.set(c, (catCount.get(c) ?? 0) + 1);
  }
  const consultByCategory = [...catCount.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const criticalOrgCount = accounts.filter((a) => a.healthTier === "critical").length;

  return {
    avgHealthScore,
    assessmentCompletionRate,
    consultByCategory,
    criticalOrgCount,
    totalFlaggedResponses: flagged.length,
  };
}
