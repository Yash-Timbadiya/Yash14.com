import { decodePhoneNumber } from "@/utils/string";
import { USER } from "@/features/portfolio/data/user";

/**
 * A wa.me link that opens a chat with a prefilled message. Used instead of
 * mailto, which does nothing on machines with no mail app set up, which is
 * most desktop browsers.
 */
export function whatsappHref(text: string) {
  const number = decodePhoneNumber(USER.phoneNumberB64).replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
