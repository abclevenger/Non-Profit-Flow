/**
 * White-label roadmap (structure only — not implemented yet):
 * - Custom domain (client.yourapp.com) + tenant routing
 * - Email templates (logo, colors in transactional email)
 * - PDF / export branding (headers, footers)
 * - Favicon + app icon upload
 * - Login / auth screen theming
 *
 * Persist alongside OrganizationSettings or a future OrganizationWhiteLabel table.
 */

export type WhiteLabelFutureFlags = {
  customDomain?: boolean;
  emailBranding?: boolean;
  pdfBranding?: boolean;
  faviconUrl?: boolean;
  loginBranding?: boolean;
};
