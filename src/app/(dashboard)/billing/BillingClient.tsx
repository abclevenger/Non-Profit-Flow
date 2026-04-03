"use client";

import { useState } from "react";
import { STRIPE_SUBSCRIPTION_DISPLAY } from "@/lib/stripe/plan-display";

type Props = {
  organizationId: string;
  organizationName: string;
  billingPlan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutReady: boolean;
  /** True when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set (for future Stripe.js). */
  publishableKeyConfigured: boolean;
  canManage: boolean;
};

export function BillingClient({
  organizationId,
  organizationName,
  billingPlan,
  stripeCustomerId,
  stripeSubscriptionId,
  stripeCheckoutReady,
  publishableKeyConfigured,
  canManage,
}: Props) {
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setBusy("checkout");
    try {
      const r = await fetch(
        `/api/organizations/${organizationId}/stripe/checkout`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout.");
    } finally {
      setBusy(null);
    }
  }

  async function openPortal() {
    setError(null);
    setBusy("portal");
    try {
      const r = await fetch(
        `/api/organizations/${organizationId}/stripe/portal`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not open billing portal.");
    } finally {
      setBusy(null);
    }
  }

  const hasCustomer = Boolean(stripeCustomerId?.trim());

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          Billing
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Manage subscription billing for{" "}
          <span className="font-medium text-stone-800">{organizationName}</span>
          .
        </p>
        <p className="mt-3 text-sm font-medium text-stone-800">
          Standard plan: {STRIPE_SUBSCRIPTION_DISPLAY.fullLabel}
        </p>
      </header>

      <section
        className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100"
        aria-labelledby="billing-status-heading"
      >
        <h2
          id="billing-status-heading"
          className="text-xs font-bold uppercase tracking-wide text-stone-500"
        >
          Status
        </h2>
        <dl className="mt-4 space-y-2 text-sm text-stone-700">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Plan label (app)</dt>
            <dd className="font-medium text-stone-900">
              {billingPlan?.trim() || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Stripe customer</dt>
            <dd className="font-mono text-xs text-stone-800">
              {stripeCustomerId?.trim() || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Subscription</dt>
            <dd className="font-mono text-xs text-stone-800">
              {stripeSubscriptionId?.trim() || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-950" role="alert">
          {error}
        </p>
      ) : null}

      {canManage ? (
        <section
          className="space-y-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 p-6"
          aria-labelledby="billing-actions-heading"
        >
          <h2
            id="billing-actions-heading"
            className="text-xs font-bold uppercase tracking-wide text-stone-500"
          >
            Actions
          </h2>
          {!stripeCheckoutReady ? (
            <p className="text-sm text-stone-600">
              Stripe Checkout is not fully configured. Set{" "}
              <code className="rounded bg-stone-200/60 px-1">STRIPE_SECRET_KEY</code>{" "}
              and{" "}
              <code className="rounded bg-stone-200/60 px-1">STRIPE_PRICE_ID</code>{" "}
              in the server environment.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={busy !== null}
                className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                aria-busy={busy === "checkout"}
                aria-label="Start Stripe checkout for subscription"
              >
                {busy === "checkout"
                  ? "Opening checkout…"
                  : `Subscribe — ${STRIPE_SUBSCRIPTION_DISPLAY.fullLabel}`}
              </button>
              <button
                type="button"
                onClick={() => void openPortal()}
                disabled={busy !== null || !hasCustomer}
                className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50"
                aria-busy={busy === "portal"}
                aria-label="Open Stripe customer billing portal"
              >
                {busy === "portal" ? "Opening portal…" : "Manage billing portal"}
              </button>
            </div>
          )}
          {!hasCustomer ? (
            <p className="text-xs text-stone-500">
              Complete checkout once to enable the customer portal.
            </p>
          ) : null}
          <p className="text-xs text-stone-500">
            Publishable key (Stripe.js):{" "}
            {publishableKeyConfigured ? (
              <span className="font-medium text-emerald-800">configured</span>
            ) : (
              <span>
                add{" "}
                <code className="rounded bg-stone-200/60 px-1">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                </code>{" "}
                to <code className="rounded bg-stone-200/60 px-1">.env.local</code>
              </span>
            )}
          </p>
        </section>
      ) : (
        <p className="text-sm text-stone-600">
          Ask an organization administrator to manage billing.
        </p>
      )}
    </div>
  );
}
