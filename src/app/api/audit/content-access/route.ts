import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const resourceType =
    typeof o.resourceType === "string" && o.resourceType.trim() ? o.resourceType.trim().slice(0, 64) : "document";
  const resourceKey = typeof o.resourceKey === "string" ? o.resourceKey.trim().slice(0, 500) : "";
  const href =
    typeof o.href === "string" && o.href.trim() ? o.href.trim().slice(0, 2000) : null;

  if (!resourceKey) {
    return NextResponse.json({ error: "resourceKey is required" }, { status: 400 });
  }

  await prisma.contentAccessLog.create({
    data: {
      userId: session.user.id,
      resourceType,
      resourceKey,
      href,
    },
  });

  return NextResponse.json({ ok: true });
}
