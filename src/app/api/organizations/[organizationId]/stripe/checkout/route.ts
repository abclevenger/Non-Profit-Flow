import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPublicAppUrl } from "@/lib/env/public-app-url";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { getStripe, getStripeDefaultPriceId } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  priceId: z.string().min(1).optional(),
  mode: z.enum(["subscription", "payment"]).optional().default("subscription"),
});

type Ctx = { params: Promise<{ organizationId: string }> };

export async function POST(req: Request, ctx: Ctx) {
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
  const defaultPrice = getStripeDefaultPriceId();
  if (!stripe || !defaultPrice) {
    return NextResponse.json(
      { error: "Stripe Checkout is not configured (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)." },
      { status: 503 },
    );
  }

  let json: unknown = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      json = await req.json();
    }
  } catch {
    /* empty body */
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const priceId = parsed.data.priceId ?? defaultPrice;
  const origin = getPublicAppUrl();
  const userId = session.user.id;
  const email = session.user.email ?? undefined;

  const checkout = await stripe.checkout.sessions.create({
    mode: parsed.data.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?checkout=success`,
    cancel_url: `${origin}/billing?checkout=canceled`,
    client_reference_id: organizationId,
    customer_email: email,
    metadata: { organizationId, userId },
    subscription_data:
      parsed.data.mode === "subscription"
        ? { metadata: { organizationId, userId } }
        : undefined,
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Checkout session missing redirect URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkout.url });
}
