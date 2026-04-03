import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import {
  canAccessAssessmentHub,
  canPerformNpAssessmentAction,
} from "@/lib/np-assessment/np-assessment-permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

const createBody = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  if (!canAccessAssessmentHub(role, Boolean(session?.user?.isPlatformAdmin))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assessments = await prisma.npAssessment.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      allowBoardMemberFill: true,
      currentCategoryIndex: true,
      submittedAt: true,
      createdAt: true,
      updatedAt: true,
      createdByUserId: true,
    },
  });
  return NextResponse.json({ assessments });
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  if (!canPerformNpAssessmentAction(role, Boolean(session?.user?.isPlatformAdmin), "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = {};
  }
  const parsed = createBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const assessment = await prisma.npAssessment.create({
    data: {
      organizationId,
      title: parsed.data.title ?? "Nonprofit organizational assessment",
      status: "NOT_STARTED",
      createdByUserId: session!.user!.id,
    },
  });
  return NextResponse.json({ assessment });
}
