import { normalizeEmail, normalizePhone } from "./phone";
import type { PartnerDestination } from "./types";

/**
 * Resolves the two business partners' notification destinations from server-side
 * environment variables. Falls back to CONTACT_NOTIFY_EMAIL for Partner 1 if
 * dedicated partner email addresses have not yet been configured.
 */
export function getPartnerDestinations(): PartnerDestination[] {
  const p1Email =
    normalizeEmail(process.env.PARTNER_1_EMAIL) ||
    normalizeEmail(process.env.CONTACT_NOTIFY_EMAIL);
  const p2Email = normalizeEmail(process.env.PARTNER_2_EMAIL);

  const p1Phone = normalizePhone(process.env.PARTNER_1_WHATSAPP);
  const p2Phone = normalizePhone(process.env.PARTNER_2_WHATSAPP);

  return [
    {
      key: "partner_1",
      name: process.env.PARTNER_1_NAME?.trim() || "Partner 1",
      email: p1Email,
      whatsapp: p1Phone,
    },
    {
      key: "partner_2",
      name: process.env.PARTNER_2_NAME?.trim() || "Partner 2",
      email: p2Email,
      whatsapp: p2Phone,
    },
  ];
}
