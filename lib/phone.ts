/**
 * Strip everything except digits. WhatsApp's wa.me expects a digits-only string
 * with the country code but NO + prefix.
 */
export function whatsappLink(phone: string): string | null {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 6) return null;
  return `https://wa.me/${digits}`;
}

export function telLink(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.replace(/\+/g, "").length < 6) return null;
  return `tel:${cleaned}`;
}
