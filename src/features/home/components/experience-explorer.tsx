"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BAND, FRAME } from "@/features/home/lib/styles";

export type ExperienceEntry = {
  id: string;
  /** Overrides the selected tab's accent, e.g. to match a company icon. */
  accent?: string;
  tab: React.ReactNode;
  panel: React.ReactNode;
};

const HASH_PREFIX = "#experience-";

export function ExperienceExplorer({
  entries,
}: {
  entries: ExperienceEntry[];
}) {
  const [active, setActive] = useState(entries[0]?.id);

  // Links like #experience-enacton select their company.
  useEffect(() => {
    const syncFromHash = () => {
      const { hash } = window.location;
      if (!hash.startsWith(HASH_PREFIX)) return;

      const id = hash.slice(HASH_PREFIX.length);
      if (entries.some((entry) => entry.id === id)) setActive(id);
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
          "grid lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]",
        )}
      >
        <div className="lg:border-r lg:border-line">
          {entries.map((entry) => (
            <button
              key={entry.id}
              id={`experience-${entry.id}`}
              type="button"
              className="group/tab relative flex w-full scroll-mt-20 flex-col gap-1.5 border-b border-hairline py-6 pr-6 pl-[1.375rem] text-left transition-colors duration-150 [--tab-accent:var(--company-accent,var(--heat))] not-aria-pressed:hover:bg-ink/4 aria-pressed:bg-[color-mix(in_srgb,var(--tab-accent)_8%,transparent)] aria-pressed:shadow-[inset_2px_0_0_var(--tab-accent)] mono:[--tab-accent:var(--heat)]"
              aria-pressed={active === entry.id}
              aria-controls={`experience-panel-${entry.id}`}
              style={
                entry.accent
                  ? ({
                      "--company-accent": entry.accent,
                    } as React.CSSProperties)
                  : undefined
              }
              onClick={() => setActive(entry.id)}
            >
              {entry.tab}
            </button>
          ))}
        </div>

        <div className="min-w-0">
          {entries.map((entry) => (
            <div
              key={entry.id}
              id={`experience-panel-${entry.id}`}
              hidden={active !== entry.id}
              className="[--tab-accent:var(--company-accent,var(--heat))] mono:[--tab-accent:var(--heat)]"
              style={
                entry.accent
                  ? ({
                      "--company-accent": entry.accent,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {entry.panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
