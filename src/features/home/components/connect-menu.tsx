"use client";

import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { IconChevronDown } from "@tabler/icons-react";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  SOCIAL_LINKS,
  SOCIAL_REDIRECT_EVENTS,
} from "@/features/portfolio/data/social-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectMenu({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={className}>
          <span className="home-stack-icons" aria-hidden>
            {SOCIAL_LINKS.map((item) => (
              <span key={item.name}>{SOCIAL_ICONS[item.name]}</span>
            ))}
          </span>
          Connect with me
          <IconChevronDown className="text-(color:--ink-56)" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="min-w-56">
        {SOCIAL_LINKS.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <a
              href={addQueryParams(item.href, UTM_PARAMS)}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackEvent(SOCIAL_REDIRECT_EVENTS[item.name], {
                  section: ANALYTICS_SECTIONS.SOCIAL_LINKS,
                  url: item.href,
                })
              }
            >
              {SOCIAL_ICONS[item.name]}
              <span>{item.title}</span>
              <span className="ml-auto pl-4 text-xs text-muted-foreground">
                {item.handle}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
