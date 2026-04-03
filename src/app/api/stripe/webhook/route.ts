import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Apply subscription customer + id to org from Stripe metadata. */
async function syncOrgFromSubscription(sub: Stripe.Subscription) {
  const organizationId = sub.metadata?.organizationId?.trim();
  if (!organizationId) return;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;
  await prisma.organization.updateMany({
    where: { id: organizationId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
    },
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const whSecret = getStripeWebhookSecret();
  if (!stripe || !whSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId?.trim();
        const customerRaw = session.customer;
        const customerId =
          typeof customerRaw === "string" ? customerRaw : customerRaw?.id;
        const subRaw = session.subscription;
        const subscriptionId =
          typeof subRaw === "string" ? subRaw : subRaw?.id ?? null;
        if (organizationId && customerId) {
          await prisma.organization.updateMany({
            where: { id: organizationId },
            data: {
              stripeCustomerId: customerId,
              ...(subscriptionId
                ? { stripeSubscriptionId: subscriptionId }
                : {}),
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        await syncOrgFromSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const organizationId = sub.metadata?.organizationId?.trim();
        if (organizationId) {
          await prisma.organization.updateMany({
            where: { id: organizationId },
            data: { stripeSubscriptionId: null },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook]", event.type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
