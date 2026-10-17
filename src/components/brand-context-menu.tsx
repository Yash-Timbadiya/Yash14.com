"use client";

import type React from "react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { copyText } from "@/utils/copy";
import { BRAND_ASSETS } from "@/config/site";
import { useCallback, useState } from "react";
import { getMarkSVG, YTMark } from "./yt-mark";
import { getWordmarkSVG } from "./yt-wordmark";
import { useRouter } from "@bprogress/next/app";
import { useTiks } from "@rexa-developer/tiks/react";
import { motion, useReducedMotion } from "motion/react";
import { Download, SquareDashed, Type } from "lucide-react";
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

export function BrandContextMenu({ children }: { children: React.ReactNode }) {
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
        if (!open) {
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
              copyText(getWordmarkSVG());
              toast.success("Logotype as SVG copied");
              success();
            }}
          >
            <Type />
            Copy Logotype as SVG
          </BrandMenuItem>

          <ContextMenuSeparator />

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => router.push("/brand-guidelines")}
          >
            <SquareDashed />
            Brand Guidelines
          </BrandMenuItem>

          <BrandMenuItem
            onActivate={activateFromElement}
            onSelect={() => {
              const anchor = document.createElement("a");
              anchor.href = BRAND_ASSETS.url;
              anchor.download = "";
              anchor.click();
            }}
          >
            <Download />
            Download Brand Assets
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
