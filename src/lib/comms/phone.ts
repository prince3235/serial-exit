import { createHash } from "node:crypto";

/** Normalize email for consistent deduplication. */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return clean || null;
}

/**
 * Normalize a phone number to E.164 digit-only format (no leading '+') expected by
 * Meta WhatsApp Cloud API (e.g. "919876543210").
 * - 10-digit Indian numbers starting with 6-9 automatically get the "91" prefix.
 * - Numbers with explicit country codes keep their digits.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  // Strip leading 00 international dialing prefix
  if (digits.startsWith("00") && digits.length > 10) {
    digits = digits.slice(2);
  }
  // Strip single leading 0 on 11-digit Indian national format e.g. 09876543210
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) {
    digits = `91${digits.slice(1)}`;
  }
  // Prepend 91 for standard 10-digit Indian mobile numbers
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = `91${digits}`;
  }
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/** Format digits as +<digits> for display. */
export function formatPhoneDisplay(digits: string | null | undefined): string {
  if (!digits) return "—";
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/** Stable hash for duplicate-submission detection within a sliding window. */
export function hashMessagePayload(email: string | null, phone: string | null, message: string): string {
  const norm = `${email ?? ""}|${phone ?? ""}|${message.trim().toLowerCase().replace(/\s+/g, " ")}`;
  return createHash("sha256").update(norm).digest("hex").slice(0, 24);
}
