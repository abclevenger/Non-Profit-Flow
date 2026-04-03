import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9\s]/, "Include a symbol (e.g. !@#$%)");

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const r = passwordSchema.safeParse(password);
  if (r.success) return { valid: true, errors: [] };
  return { valid: false, errors: r.error.issues.map((i) => i.message) };
}