"use client";

import { encode } from "qss";
import * as React from "react";
import { cn } from "@/lib/utils";
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
  width = 200,
  height = 125,
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
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });
    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = React.useState(false);

  // Warm the screenshot on intent (hover/focus) rather than on mount, so a page
  // with many previews doesn't fetch every screenshot up front.
  const preloaded = React.useRef(false);
  const preload = () => {
    if (preloaded.current || !src) return;
    preloaded.current = true;
    const image = new Image();
    image.src = src;
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
                className="block rounded-xl border-2 border-transparent bg-neutral-300 dark:bg-zinc-800 p-1 shadow hover:border-border"
                style={{ fontSize: 0 }}
              >
                <img
                  src={isStatic ? imageSrc : src}
                  width={width}
                  height={height}
                  className="rounded-lg"
                  alt=""
                />
              </a>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </HoverCardContent>
    </HoverCard>
  );
}
