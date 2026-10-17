import { trackEvent } from "@/lib/analytics";

/**
 * Copies text to the clipboard. When `item` is given, a successful copy is
 * recorded as a `content_copied` event for that item.
 */
export const copyText = async (text: string, item?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    if (item) {
      trackEvent("content_copied", { item });
    }
    return true;
  } catch {
    return false;
  }
};
