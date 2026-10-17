"use client";

import { cn } from "@/lib/utils";
import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { Button } from "@/components/base/ui/button";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Panel, PanelContent } from "@/features/portfolio/components/panel";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";
import {
  SOCIAL_LINKS,
  SOCIAL_REDIRECT_EVENTS,
} from "@/features/portfolio/data/social-links";

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_QUINT },
  },
};

const ASCII_ROWS = [
  {
    id: "row-1",
    pattern: "░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░░▒▒▓▓██",
  },
  {
    id: "row-2",
    pattern: "▒▓█▓▒░ ░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░",
  },
  {
    id: "row-3",
    pattern: "░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░░▒▒▓▓██▓▓▒▒░░ ░▒▓█▓▒░ ░░▒▒▓▓██",
  },
];

function AsciiWall({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute inset-y-0 flex w-1/2 flex-col justify-center overflow-hidden select-none",
        isLeft
          ? "left-0 items-end mask-[linear-gradient(90deg,black_0%,black_25%,transparent_90%)]"
          : "right-0 items-start mask-[linear-gradient(270deg,black_0%,black_25%,transparent_90%)]",
      )}
      initial={
        shouldReduceMotion ? false : { opacity: 0, x: isLeft ? -12 : 12 }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : 0.1,
        ease: EASE_OUT_QUINT,
      }}
      aria-hidden
    >
      {ASCII_ROWS.map((row, i) => (
        <motion.pre
          key={row.id}
          className="bg-[linear-gradient(90deg,var(--color-muted-foreground)_0%,var(--color-foreground)_50%,var(--color-muted-foreground)_100%)] bg-clip-text font-mono text-[10px] leading-4 whitespace-nowrap text-transparent"
          style={{ willChange: "opacity" }}
          initial={false}
          animate={
            shouldReduceMotion
              ? { opacity: 0.16 }
              : { opacity: [0.1, 0.22, 0.1] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }
          }
        >
          {row.pattern.repeat(10)}
        </motion.pre>
      ))}
    </motion.div>
  );
}

export function SocialLinks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Panel>
      <h2 className="sr-only">Social Links</h2>

      <PanelContent className="relative overflow-hidden">
        <AsciiWall side="left" />
        <AsciiWall side="right" />

        <motion.ul
          className="relative z-10 flex flex-wrap justify-center gap-2"
          variants={listVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {SOCIAL_LINKS.map((item) => (
            <motion.li
              key={item.name}
              variants={itemVariants}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.15, ease: EASE_OUT_QUINT }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      className="text-foreground/80 shadow-none [&_svg:not([class*='size-'])]:size-4.5 bg-background! rounded-sm"
                      variant="outline"
                      size="icon-sm"
                      nativeButton={false}
                      render={
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
                          <span className="sr-only">{item.title}</span>
                        </a>
                      }
                    />
                  }
                />
                <TooltipContent>
                  {item.title} ({item.handle})
                </TooltipContent>
              </Tooltip>
            </motion.li>
          ))}
        </motion.ul>
      </PanelContent>
    </Panel>
  );
}
