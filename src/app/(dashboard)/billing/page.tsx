import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripePublishableKey } from "@/lib/stripe/publishable-key";
import { getStripeDefaultPriceId } from "@/lib/stripe/server";
import { BillingClient } from "./BillingClient";

export const metadata = {
  title: "Billing | Non-Profit Flow",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.activeOrganizationId) {
    redirect("/overview");
  }

  const orgId = session.user.activeOrganizationId;
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      billingPlan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
  if (!org) {
    redirect("/overview");
  }

  const stripeReady = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && getStripeDefaultPriceId(),
  );
  const publishableKeyConfigured = Boolean(getStripePublishableKey());

  return (
    <BillingClient
      organizationId={org.id}
      organizationName={org.name}
      billingPlan={org.billingPlan}
      stripeCustomerId={org.stripeCustomerId}
      stripeSubscriptionId={org.stripeSubscriptionId}
      stripeCheckoutReady={stripeReady}
      publishableKeyConfigured={publishableKeyConfigured}
      canManage={session.user.canManageOrganizationSettings === true}
    />
  );
}
