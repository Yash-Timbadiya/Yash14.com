"use client";

import { useEffect, useState } from "react";

export type ExperienceEntry = {
  id: string;
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
    <div className="home-band">
      <div className="home-frame grid lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-line">
          {entries.map((entry) => (
            <button
              key={entry.id}
              id={`experience-${entry.id}`}
              type="button"
              className="home-usecase scroll-mt-20"
              aria-pressed={active === entry.id}
              aria-controls={`experience-panel-${entry.id}`}
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
            >
              {entry.panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
