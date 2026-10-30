"use client";

import { encode } from "qss";
import * as React from "react";
import { cn } from "@/lib/utils";
import { config } from "@/config";
import { cdn } from "@/utils/cdn";
import {
  getLinkPreviewSlug,
  LINK_PREVIEW_DIR,
} from "@/utils/link-preview-slug.mjs";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const DESKTOP_VIEWPORT_WIDTH = 1280;

/** Shared across every preview so each image is fetched once per page view. */
const preloadedImages = new Map<string, Promise<boolean>>();

function preloadImage(src: string) {
  let pending = preloadedImages.get(src);
  if (!pending) {
    pending = new Promise<boolean>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
    preloadedImages.set(src, pending);
  }
  return pending;
}

/** Runs after the page has loaded and the main thread is idle. */
function onPageIdle(callback: () => void) {
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(callback, 200);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    window.removeEventListener("load", schedule);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    clearTimeout(timeoutId);
  };
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
  target?: string;
  rel?: string;
  side?: "top" | "bottom" | "left" | "right";
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export function LinkPreview({
  children,
  url,
  className,
  width = 192,
  height = 108,
  quality: _quality = 50,
  layout: _layout = "fixed",
  isStatic = false,
  imageSrc = "",
  target = "_blank",
  rel = "noopener",
  side = "top",
  onClick,
}: LinkPreviewProps) {
  let liveSrc: string;
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      // A laptop-sized viewport, scaled down to the card, so sites render
      // their desktop layout instead of the cramped mobile one.
      "viewport.isMobile": false,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": DESKTOP_VIEWPORT_WIDTH,
      "viewport.height": Math.round((DESKTOP_VIEWPORT_WIDTH * height) / width),
    });
    liveSrc = `${config.microlink.apiUrl}/?${params}`;
  } else {
    liveSrc = imageSrc;
  }

  const hostname = getHostname(url);
  const slug = isStatic ? null : getLinkPreviewSlug(url);
  const fallbackSrc = slug ? cdn(`/${LINK_PREVIEW_DIR}/${slug}.webp`) : null;

  const [isOpen, setOpen] = React.useState(false);

  // The pre-captured CDN screenshot comes first because it loads instantly;
  // Microlink takes 3-30s uncached and its free tier stops after 25 a day per
  // IP, so it is only used for links that have no CDN screenshot yet.
  const sources = React.useMemo(
    () => [fallbackSrc, liveSrc].filter((source): source is string => !!source),
    [fallbackSrc, liveSrc],
  );
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const currentSrc = sources[sourceIndex];

  const skipSource = React.useCallback(
    (failedSrc: string) => {
      setSourceIndex((index) =>
        sources[index] === failedSrc ? index + 1 : index,
      );
    },
    [sources],
  );

  const warm = React.useCallback(
    (src: string | undefined) => {
      if (!src) return;
      void preloadImage(src).then((loaded) => {
        if (!loaded) skipSource(src);
      });
    },
    [skipSource],
  );

  // Warm the first source in the background so hovering shows it immediately.
  React.useEffect(() => onPageIdle(() => warm(sources[0])), [sources, warm]);

  const preload = () => warm(currentSrc);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <HoverCard openDelay={50} closeDelay={100} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <a
          href={url}
          target={target}
          rel={rel}
          onMouseMove={handleMouseMove}
          onPointerEnter={preload}
          onFocus={preload}
          onClick={onClick}
          className={cn("text-foreground", className)}
          data-link-preview=""
        >
          {children}
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-auto border-0 bg-transparent p-0 shadow-none ring-0"
        side={side}
        align="center"
        sideOffset={10}
        avoidCollisions
        collisionPadding={16}
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              className="rounded-xl shadow-xl"
              style={{ x: translateX }}
            >
              <a
                href={url}
                target={target}
                rel={rel}
                onClick={onClick}
                className="block overflow-hidden rounded-xl bg-neutral-200 shadow ring-1 ring-black/10 transition-shadow hover:ring-black/20 dark:bg-zinc-800 dark:ring-white/10 dark:hover:ring-white/20"
              >
                <div
                  aria-hidden
                  className="relative flex h-5 items-center gap-1 px-2"
                >
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />
                  {hostname ? (
                    <span className="absolute inset-x-12 truncate text-center font-sans text-[9px] leading-none text-muted-foreground">
                      {hostname}
                    </span>
                  ) : null}
                </div>
                {!currentSrc ? (
                  <div
                    style={{ width, height }}
                    className="flex items-center justify-center bg-background font-mono text-xs text-muted-foreground"
                  >
                    {hostname}
                  </div>
                ) : (
                  <img
                    key={currentSrc}
                    src={currentSrc}
                    width={width}
                    height={height}
                    className="block bg-background object-cover object-top"
                    alt=""
                    onError={() => skipSource(currentSrc)}
                  />
                )}
              </a>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </HoverCardContent>
    </HoverCard>
  );
}
