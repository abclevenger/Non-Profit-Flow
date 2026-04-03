/**
 * Billing copy for the active Checkout price. Keep in sync with the recurring Price
 * referenced by STRIPE_PRICE_ID in Stripe Dashboard (amount + interval).
 */
export const STRIPE_SUBSCRIPTION_DISPLAY = {
  amountLabel: "$299.99",
  intervalLabel: "per month",
  /** Full phrase for headings and buttons. */
  fullLabel: "$299.99 per month",
} as const;
