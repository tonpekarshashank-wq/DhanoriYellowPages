/**
 * Build WhatsApp deep link with a pre-filled message.
 * The spec requires: "Hi, I found you on Dhanori Yellow Pages…"
 */
export function whatsappUrl(phone: string, listingName?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const message = listingName
    ? `Hi, I found you on Dhanori Yellow Pages. I'd like to enquire about ${listingName}.`
    : `Hi, I found you on Dhanori Yellow Pages.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Build tel: link from E.164 phone.
 */
export function telUrl(phone: string): string {
  return `tel:${phone}`;
}
