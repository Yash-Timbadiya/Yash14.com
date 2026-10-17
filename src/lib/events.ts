import { z } from "zod";
import posthog from "posthog-js";
import { config } from "@/config";

const eventSchema = z.object({
  name: z.enum([
    "copy_email",
    "copy_phone_number",
    "play_name_pronunciation",
    "open_command_menu",
    "command_menu_search",
    "command_menu_action",
    "toc_inline_toggle",
    "toc_inline_item_click",
    "toc_minimap_hover",
    "toc_minimap_item_click",
    "keyboard_shortcut_navigate",
    "copy_document_page",
    "share_document_link",
  ]),
  // declare type AllowedPropertyValues = string | number | boolean | null
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    )
    .optional(),
});

export type Event = z.infer<typeof eventSchema>;

export function trackEvent(input: Event) {
  const event = eventSchema.parse(input);
  if (
    event &&
    config.analytics.posthogProjectToken &&
    config.analytics.posthogHost
  ) {
    posthog.capture(event.name, event.properties);
  }
}
