import * as OTPAuth from "otpauth";

export function verifyTotpToken(secret: string, token: string): boolean {
  const cleaned = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const totp = new OTPAuth.TOTP({
    issuer: "Board Dashboard",
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.validate({ token: cleaned, window: 1 }) != null;
}

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function totpKeyUri(params: { secret: string; email: string; issuer?: string }): string {
  const totp = new OTPAuth.TOTP({
    issuer: params.issuer ?? "Board Dashboard",
    label: params.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(params.secret),
  });
  return totp.toString();
}