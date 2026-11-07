"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DisclosureChevron } from "./hover-arrow";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, useReducedMotion } from "motion/react";
import { BAND, FRAME } from "@/features/home/lib/styles";

export type ExperienceEntry = {
  id: string;
  /** Overrides the selected tab's accent, e.g. to match a company icon. */
  accent?: string;
  tab: React.ReactNode;
  panel: React.ReactNode;
};

const HASH_PREFIX = "#experience-";

/**
 * Wide screens: companies down the left, the selected one's details on the
 * right, the first selected by default. Narrow screens: an accordion where
 * every company starts closed and opens its details right under itself.
 *
 * One interleaved list (tab, panel, tab, panel...) serves both: on wide
 * screens the tabs fill the first column and every panel sits in the second
 * column across all rows, with only the selected one shown.
 */
export function ExperienceExplorer({
  entries,
}: {
  entries: ExperienceEntry[];
}) {
  const [active, setActive] = useState(entries[0]?.id);
  const [open, setOpen] = useState<string | null>(null);
  // Only animate after the first choice, so the page loads without motion.
  const [interacted, setInteracted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const reduceMotion = useReducedMotion();

  // Links like #experience-enacton select (and open) their company.
  useEffect(() => {
    const syncFromHash = () => {
      const { hash } = window.location;
      if (!hash.startsWith(HASH_PREFIX)) return;

      const id = hash.slice(HASH_PREFIX.length);
      if (entries.some((entry) => entry.id === id)) {
        setActive(id);
        setOpen(id);
        setInteracted(true);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [entries]);

  return (
    <div className={BAND}>
      <div
        className={cn(
          FRAME,
          "grid lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-rows-[repeat(var(--tabs),auto)_1fr]",
        )}
        style={{ "--tabs": entries.length } as React.CSSProperties}
      >
        {/* The rail between the tabs and the panel on wide screens. */}
        <span
          className="pointer-events-none absolute inset-y-0 left-75.75 w-px bg-line max-lg:hidden"
          aria-hidden
        />

        {entries.map((entry) => {
          const accent = entry.accent
            ? ({ "--company-accent": entry.accent } as React.CSSProperties)
            : undefined;
          const isActive = active === entry.id;
          const isOpen = open === entry.id;

          return [
            <button
              key={`${entry.id}-tab`}
              id={`experience-${entry.id}`}
              type="button"
              className="group/tab relative flex w-full scroll-mt-20 flex-col gap-1.5 border-b border-hairline py-6 pr-12 pl-5.5 text-left transition-colors duration-150 [--tab-accent:var(--company-accent,var(--heat))] mono:[--tab-accent:var(--heat)] lg:col-start-1 lg:pr-6 max-lg:not-data-open:hover:bg-ink/4 lg:not-data-active:hover:bg-ink/4 max-lg:data-open:bg-[color-mix(in_srgb,var(--tab-accent)_8%,transparent)] max-lg:data-open:shadow-[inset_2px_0_0_var(--tab-accent)] lg:data-active:bg-[color-mix(in_srgb,var(--tab-accent)_8%,transparent)] lg:data-active:shadow-[inset_2px_0_0_var(--tab-accent)]"
              data-active={isActive || undefined}
              data-open={isOpen || undefined}
              aria-controls={`experience-panel-${entry.id}`}
              aria-expanded={isOpen}
              style={accent}
              onClick={() => {
                setActive(entry.id);
                setInteracted(true);
                setOpen((current) => (current === entry.id ? null : entry.id));
              }}
            >
              {entry.tab}
              <DisclosureChevron className="absolute top-7.5 right-6 text-ink/40 lg:hidden" />
            </button>,

            <div
              key={`${entry.id}-panel`}
              id={`experience-panel-${entry.id}`}
              className={cn(
                "min-w-0 [--tab-accent:var(--company-accent,var(--heat))] mono:[--tab-accent:var(--heat)] lg:col-start-2 lg:row-span-full",
                !isActive && "lg:hidden",
              )}
              style={accent}
            >
              {/* Narrow screens: the details slide open under the company.
                  Wide screens always show the selected panel at full height. */}
              <motion.div
                className="max-lg:overflow-hidden lg:h-auto! lg:opacity-100!"
                initial={false}
                animate={
                  isOpen
                    ? { height: "auto", opacity: 1 }
                    : { height: 0, opacity: 0 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                }
                inert={!isDesktop && !isOpen}
              >
                {/* Remounts when the company changes, so its details rise in. */}
                <motion.div
                  key={String(isActive)}
                  className="max-lg:border-b max-lg:border-hairline"
                  initial={
                    interacted && !reduceMotion
                      ? { opacity: 0, y: 10, filter: "blur(4px)" }
                      : false
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {entry.panel}
                </motion.div>
              </motion.div>
            </div>,
          ];
        })}
      </div>
    </div>
  );
}
