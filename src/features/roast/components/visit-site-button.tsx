"use client";

import type { RoastResult } from "@/features/roast/types";

import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * The roasted site's own URL with UTM tags, so its owner sees the roaster as
 * the source of the visit in their analytics.
 */
export function visitUrl(result: RoastResult) {
  const url = new URL(result.url);
  url.searchParams.set("utm_source", "yash14.com");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "roast-my-site");
  return url.href;
}

/** Icon button that opens the roasted site in a new tab. */
export function VisitSiteButton({
  result,
  onVisit,
}: {
  result: RoastResult;
  onVisit?: () => void;
}) {
  // A dead site has nothing to open.
  if (result.dead) return null;

  const label = `Visit ${result.domain}`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" asChild>
          <a
            href={visitUrl(result)}
            target="_blank"
            rel="noopener"
            aria-label={label}
            onClick={onVisit}
          >
            <ExternalLinkIcon />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
