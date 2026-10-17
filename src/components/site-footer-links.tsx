"use client";

import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { config } from "@/config";
import { copyText } from "@/utils/copy";
import { SITE_INFO } from "@/config/site";
import { DmcaIcon } from "@/components/icons";
import { BotIcon, LinkIcon, RssIcon } from "lucide-react";
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
  },
  {
    label: "RSS",
    href: "/rss",
    icon: RssIcon,
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
            <FooterLink label={link.label} href={link.href}>
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
  children,
}: {
  label?: string;
  href: string;
  copyUrl?: string;
  ariaLabel?: string;
  className?: string;
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
        >
          {children}
          {label}
        </Link>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-fit">
        <ContextMenuItem
          onClick={() => {
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
