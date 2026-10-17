"use client";

import type { AnalyticsSection } from "@/lib/analytics-events";

import { toast } from "sonner";
import { copyText } from "@/utils/copy";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/base/ui/button";
import { LinkedInIcon, XIcon } from "@/components/icons";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { EllipsisIcon, LinkIcon, ShareIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

export function DocShareMenu({
  title,
  url,
  section,
}: {
  title: string;
  url: string;
  section: AnalyticsSection;
}) {
  const absoluteUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? new URL(url, window.location.origin).toString()
      : url;

  const urlEncoded = encodeURIComponent(absoluteUrl);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          trackEvent(ANALYTICS_EVENTS.SHARE_MENU_OPENED, { section, url });
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            className="size-7 border-none active:scale-none"
            variant="secondary"
            size="icon-sm"
          >
            <ShareIcon />
          </Button>
        }
      />

      <DropdownMenuContent
        className="w-fit"
        align="start"
        alignOffset={-6}
        collisionPadding={16}
        finalFocus={false}
      >
        <DropdownMenuItem
          onClick={async () => {
            if (await copyText(absoluteUrl)) {
              trackEvent(ANALYTICS_EVENTS.COPY_PAGE_LINK, { section, url });
              toast.success("Link copied");
            }
          }}
        >
          <LinkIcon />
          Copy link
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <a
              href={`https://x.com/intent/tweet?url=${urlEncoded}`}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.SHARE_ON_X, { section, url })
              }
              target="_blank"
              rel="noopener"
            >
              <XIcon />
              Share on X
            </a>
          }
        />

        <DropdownMenuItem
          render={
            <a
              href={`https://www.linkedin.com/sharing/share-offsite?url=${urlEncoded}`}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.SHARE_ON_LINKEDIN, { section, url })
              }
              target="_blank"
              rel="noopener"
            >
              <LinkedInIcon />
              Share on LinkedIn
            </a>
          }
        />

        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem
            closeOnClick={false}
            onClick={() => {
              navigator
                .share({ title, url: absoluteUrl })
                .then(() =>
                  trackEvent(ANALYTICS_EVENTS.SHARE_NATIVE, { section, url }),
                )
                .catch(() => {});
            }}
          >
            <EllipsisIcon />
            Other app
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
