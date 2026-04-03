import "server-only";

type SendOpts = {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
};

/**
 * Sends transactional email for expert review routing.
 * Configure one of:
 * - RESEND_API_KEY + EMAIL_FROM (Resend HTTP API)
 * - SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + EMAIL_FROM (nodemailer optional — not bundled; use Resend in production)
 */
export async function sendIssueRoutingEmail(opts: SendOpts): Promise<{ ok: boolean; error?: string }> {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    return { ok: false, error: "EMAIL_FROM is not configured" };
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject: opts.subject,
          text: opts.textBody,
          html: opts.htmlBody,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        return { ok: false, error: typeof data.message === "string" ? data.message : res.statusText };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Resend request failed" };
    }
  }

  return {
    ok: false,
    error:
      "No email transport configured. Set RESEND_API_KEY and EMAIL_FROM, or extend sendIssueRoutingEmail for SMTP.",
  };
}
