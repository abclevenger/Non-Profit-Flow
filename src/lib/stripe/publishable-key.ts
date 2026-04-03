/**
 * Stripe publishable key for Stripe.js / Payment Element (safe in the browser).
 * Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local — never commit real values.
 */
export function getStripePublishableKey(): string | null {
  const k = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return k && k.startsWith("pk_") ? k : null;
}
