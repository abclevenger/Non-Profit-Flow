import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublicAppUrl } from "@/lib/env/public-app-url";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  if (!canManageOrganizationSettings(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });
  const customerId = org?.stripeCustomerId?.trim();
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file. Complete Checkout first." },
      { status: 400 },
    );
  }

  const origin = getPublicAppUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
