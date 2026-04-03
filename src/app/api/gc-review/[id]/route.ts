import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canUpdateGcReview } from "@/lib/gc-review/permissions";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { isGcStatusKey, toFullJson } from "@/lib/gc-review/serialize";
import { prisma } from "@/lib/prisma";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id || !canUpdateGcReview(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const data: {
    reviewedByUserId: string;
    status?: string;
    reviewNotes?: string | null;
    recommendation?: string | null;
    nextStep?: string | null;
    reviewCompletedAt?: Date | null;
  } = { reviewedByUserId: session.user.id };

  if (typeof o.status === "string" && isGcStatusKey(o.status.trim())) {
    data.status = o.status.trim();
  }

  const optNote = (k: "reviewNotes" | "recommendation" | "nextStep", max: number) => {
    if (!(k in o)) return;
    const v = o[k];
    if (typeof v !== "string") return;
    data[k] = v.trim().slice(0, max) || null;
  };
  optNote("reviewNotes", 8000);
  optNote("recommendation", 4000);
  optNote("nextStep", 4000);

  if (typeof o.reviewCompletedAt === "string" && o.reviewCompletedAt.trim()) {
    const d = new Date(o.reviewCompletedAt);
    if (!Number.isNaN(d.getTime())) data.reviewCompletedAt = d;
  } else if (o.reviewCompletedAt === null) {
    data.reviewCompletedAt = null;
  }

  if (Object.keys(data).length <= 1 && data.status === undefined) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const row = await prisma.gcReviewRequest.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await assertOrgAccess(session, row.organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const updated = await prisma.gcReviewRequest.update({
    where: { id },
    data,
  });
  return NextResponse.json({ ok: true, item: toFullJson(updated) });
}
