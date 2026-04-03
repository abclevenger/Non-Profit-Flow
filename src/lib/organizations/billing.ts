/**
 * Billing roadmap (not implemented):
 * - Plans: STARTER | GROWTH | ENTERPRISE (`Organization.billingPlan`)
 * - Gate modules, seat limits, white-label, exports, AI via plan + feature flags
 */

export const BILLING_PLANS = ["STARTER", "GROWTH", "ENTERPRISE"] as const;
export type BillingPlanId = (typeof BILLING_PLANS)[number];
