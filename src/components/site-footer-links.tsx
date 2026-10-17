"use client";

import type { AnalyticsEvent } from "@/lib/analytics-events";

import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { config } from "@/config";
import { copyText } from "@/utils/copy";
import { SITE_INFO } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { DmcaIcon } from "@/components/icons";
import { BotIcon, LinkIcon, RssIcon } from "lucide-react";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const DMCA_URL = config.dmca.url;

const FOOTER_LINKS = [
  {
    label: "llms.txt",
    href: "/llms.txt",
    icon: BotIcon,
    event: ANALYTICS_EVENTS.VIEW_LLMS_TXT,
  },
  {
    label: "RSS",
    href: "/rss",
    icon: RssIcon,
    event: ANALYTICS_EVENTS.VIEW_RSS,
  },
] as const;

export function SiteFooterLinks() {
  return (
    <div className="mx-auto flex items-center justify-center gap-3 border-x border-line bg-background px-4">
      {FOOTER_LINKS.map((link, index) => {
        const Icon = link.icon;

        return (
          <div className="contents" key={link.href}>
            {index > 0 ? <Separator /> : null}
            <FooterLink label={link.label} href={link.href} event={link.event}>
              <Icon className="size-4" />
            </FooterLink>
          </div>
        );
      })}

      <Separator />

      <FooterLink
        href={DMCA_URL || ""}
        copyUrl={DMCA_URL}
        ariaLabel="DMCA.com Protection Status"
        event={ANALYTICS_EVENTS.VIEW_DMCA}
        className="font-sans"
      >
        <DmcaIcon className="h-4.5 w-auto" />
      </FooterLink>
    </div>
  );
}

function FooterLink({
  label,
  href,
  copyUrl,
  ariaLabel,
  className,
  event,
  children,
}: {
  label?: string;
  href: string;
  copyUrl?: string;
  ariaLabel?: string;
  className?: string;
  event: AnalyticsEvent;
  children: React.ReactNode;
}) {
  const absoluteUrl = copyUrl ?? `${SITE_INFO.url}${href}`;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-[color] hover:text-foreground",
            className,
          )}
          href={href}
          target="_blank"
          rel="noopener"
          aria-label={ariaLabel}
          onClick={() =>
            trackEvent(event, {
              section: ANALYTICS_SECTIONS.FOOTER,
              source: ANALYTICS_SOURCES.FOOTER_LINKS,
              url: absoluteUrl,
            })
          }
        >
          {children}
          {label}
        </Link>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-fit">
        <ContextMenuItem
          onClick={() => {
            trackEvent(ANALYTICS_EVENTS.COPY_LINK, {
              section: ANALYTICS_SECTIONS.FOOTER,
              source: ANALYTICS_SOURCES.FOOTER_LINKS,
              url: absoluteUrl,
            });
            copyText(absoluteUrl);
            toast.success("Link copied");
          }}
        >
          <LinkIcon />
          Copy link
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function Separator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex h-11 w-px bg-line", className)} {...props} />;
}
