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

/**
 * How long Microlink gets before the CDN screenshot is shown instead. Uncached
 * Microlink renders take 3-30s, and its free tier stops after 25 a day per IP.
 */
const LIVE_SCREENSHOT_TIMEOUT_MS = 3500;

/** `live` is Microlink (or `imageSrc`), `fallback` the CDN screenshot, `none` neither loaded. */
type PreviewSource = "live" | "fallback" | "none";

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
  let src: string;
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
    src = `${config.microlink.apiUrl}/?${params}`;
  } else {
    src = imageSrc;
  }

  const hostname = getHostname(url);
  const slug = isStatic ? null : getLinkPreviewSlug(url);
  const fallbackSrc = slug ? cdn(`/${LINK_PREVIEW_DIR}/${slug}.webp`) : null;

  const [isOpen, setOpen] = React.useState(false);
  const [source, setSource] = React.useState<PreviewSource>("live");

  const showFallback = React.useCallback(() => {
    setSource((current) =>
      current === "live" ? (fallbackSrc ? "fallback" : "none") : current,
    );
  }, [fallbackSrc]);

  const liveLoaded = React.useRef(false);
  const fallbackTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(fallbackTimer.current), []);

  // Warm the screenshot on intent (hover/focus) rather than on mount, so a page
  // with many previews doesn't fetch every screenshot up front.
  const preloaded = React.useRef(false);
  const preload = () => {
    if (preloaded.current || !src) return;
    preloaded.current = true;
    const image = new Image();
    image.onload = () => {
      liveLoaded.current = true;
    };
    // A rate-limited Microlink request fails fast, so switch without waiting.
    image.onerror = showFallback;
    image.src = src;
    if (isStatic) return;
    fallbackTimer.current = setTimeout(() => {
      if (!liveLoaded.current) showFallback();
    }, LIVE_SCREENSHOT_TIMEOUT_MS);
  };

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
                {source === "none" ? (
                  <div
                    style={{ width, height }}
                    className="flex items-center justify-center bg-background font-mono text-xs text-muted-foreground"
                  >
                    {hostname}
                  </div>
                ) : (
                  <img
                    key={source}
                    src={
                      source === "fallback" && fallbackSrc ? fallbackSrc : src
                    }
                    width={width}
                    height={height}
                    className="block bg-background object-cover object-top"
                    alt=""
                    onLoad={() => {
                      if (source === "live") liveLoaded.current = true;
                    }}
                    onError={() =>
                      source === "live" ? showFallback() : setSource("none")
                    }
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
