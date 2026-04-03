import "server-only";

import Stripe from "stripe";

const API_VERSION: Stripe.LatestApiVersion = "2025-02-24.acacia";

let cached: Stripe | null | undefined;

/** Server-only Stripe client; null when STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Stripe(key, {
    apiVersion: API_VERSION,
    appInfo: { name: "Non-Profit Flow", version: "0.1.0" },
  });
  return cached;
}

export function getStripeWebhookSecret(): string | null {
  const s = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return s || null;
}

/** Default recurring price for Checkout (price_… from Stripe Dashboard). */
export function getStripeDefaultPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  return id || null;
}
