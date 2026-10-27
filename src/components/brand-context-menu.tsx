"use client";

import type React from "react";
import type { AnalyticsSection } from "@/lib/analytics-events";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { copyText } from "@/utils/copy";
import { BRAND_ASSETS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { useCallback, useState } from "react";
import { getMarkSVG, YTMark } from "./yt-mark";
import { getWordmarkSVG } from "./yt-wordmark";
import { useRouter } from "@bprogress/next/app";
import { useTiks } from "@rexa-developer/tiks/react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Download, SquareDashed, Type } from "lucide-react";
import { ANALYTICS_EVENTS, ANALYTICS_SOURCES } from "@/lib/analytics-events";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const BRAND_MENU_ACTIVE_SPRING = {
  type: "spring",
  stiffness: 480,
  damping: 38,
} as const;

type ActiveRect = {
  top: number;
  height: number;
};

export function BrandContextMenu({
  children,
  section,
}: {
  children: React.ReactNode;
  /** Where the logo this menu wraps is shown, sent with its events. */
  section: AnalyticsSection;
}) {
  const router = useRouter();
  const { success } = useTiks();
  const reduceMotion = useReducedMotion();
  const [activeRect, setActiveRect] = useState<ActiveRect | null>(null);

  const activateFromElement = useCallback((element: HTMLElement) => {
    setActiveRect({
      top: element.offsetTop,
      height: element.offsetHeight,
    });
  }, []);

  const clearActive = useCallback(() => {
    setActiveRect(null);
  }, []);

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) {
          trackEvent(ANALYTICS_EVENTS.LOGO_RIGHT_CLICK, { section });
        } else {
          clearActive();
        }
      }}
    >
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-fit">
        <div className="relative" onPointerLeave={clearActive}>
          {activeRect ? (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-0 rounded-lg bg-primary/5"
              initial={false}
              animate={{
                top: activeRect.top,
                height: activeRect.height,
              }}
              transition={
                reduceMotion ? { duration: 0 } : BRAND_MENU_ACTIVE_SPRING
              }
            />
          ) : null}

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.VIEW_HOME, {
                section,
                source: ANALYTICS_SOURCES.LOGO_MENU,
              });
              window.open("/", "_blank", "noopener");
            }}
          >
            <ArrowUpRight />
            Open in New Tab
          </BrandMenuItem>

          <ContextMenuSeparator />

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.COPY_MARK_SVG, {
                section,
                source: ANALYTICS_SOURCES.LOGO_MENU,
              });
              copyText(getMarkSVG());
              toast.success("Mark as SVG copied");
              success();
            }}
          >
            <YTMark />
            Copy Mark as SVG
          </BrandMenuItem>

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.COPY_LOGOTYPE_SVG, {
                section,
                source: ANALYTICS_SOURCES.LOGO_MENU,
              });
              copyText(getWordmarkSVG());
              toast.success("Logotype as SVG copied");
              success();
            }}
          >
            <Type />
            Copy Logotype as SVG
          </BrandMenuItem>

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.DOWNLOAD_BRAND_ASSETS, {
                section,
                source: ANALYTICS_SOURCES.LOGO_MENU,
                url: BRAND_ASSETS.url,
              });
              const anchor = document.createElement("a");
              anchor.href = BRAND_ASSETS.url;
              anchor.download = "";
              anchor.click();
            }}
          >
            <Download />
            Download Brand Assets
          </BrandMenuItem>

          <ContextMenuSeparator />

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.VIEW_BRAND_GUIDELINES, {
                section,
                source: ANALYTICS_SOURCES.LOGO_MENU,
              });
              router.push("/brand-guidelines");
            }}
          >
            <SquareDashed />
            Visit Brand Guidelines
          </BrandMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function BrandMenuItem({
  children,
  onActivate,
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuItem> & {
  onActivate: (element: HTMLElement) => void;
}) {
  const handleActivate = (e: React.SyntheticEvent<HTMLElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      onActivate(e.currentTarget);
    }
  };

  return (
    <ContextMenuItem
      {...props}
      className={cn("bg-transparent focus:bg-transparent", className)}
      onPointerEnter={handleActivate}
      onFocus={handleActivate}
    >
      <div className="relative z-10 flex w-full min-w-0 items-center gap-2">
        {children}
      </div>
    </ContextMenuItem>
  );
}

export default BrandContextMenu;
