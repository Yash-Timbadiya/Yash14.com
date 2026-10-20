import type { TechStack as TechStackType } from "../types/tech-stack";

import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { TECH_STACK } from "../data/tech-stack";
import { PanelTitleCopy } from "./panel-title-copy";
import { TrackedLink } from "@/components/tracked-link";
import { Panel, PanelHeader, PanelTitle } from "./panel";
import { TechStackItemIcon } from "./tech-stack-brand-icons";
import { TECH_STACK_BRAND_ICONS } from "../data/tech-stack-brand-icons";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const ID = "stack";

export function TechStack() {
  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <TrackedLink
            href={`#${ID}`}
            event={ANALYTICS_EVENTS.VIEW_SECTION}
            eventProperties={{
              section: ANALYTICS_SECTIONS.TECH_STACK,
              source: ANALYTICS_SOURCES.HEADING,
              target: ID,
            }}
          >
            Stack
          </TrackedLink>
          <PanelTitleCopy id={ID} section={ANALYTICS_SECTIONS.TECH_STACK} />
        </PanelTitle>
      </PanelHeader>

      <div className="relative [--badge-height:--spacing(6)] [--col-left-width:--spacing(48)]">
        <div
          className="pointer-events-none absolute inset-y-0 left-(--col-left-width) -z-1 w-px border-r border-dashed border-line max-sm:hidden"
          aria-hidden
        />

        {Object.entries(groupByCategory(TECH_STACK)).map(
          ([category, items], index) => {
            const categoryId = `${ID}-${category
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}`;

            return (
              <div
                key={category}
                className="grid items-start gap-y-2 border-b border-line py-4 last:border-none sm:grid-cols-[var(--col-left-width)_1fr]"
              >
                <div id={categoryId} className="pl-4 text-sm/(--badge-height)">
                  <span
                    className="mr-1.5 font-mono text-muted-foreground/80 select-none"
                    aria-hidden
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  {category}
                </div>

                <ul
                  aria-labelledby={categoryId}
                  className="flex flex-wrap gap-1.5 px-4"
                >
                  {items.map((item) => {
                    return (
                      <li key={item.key} className="flex">
                        <TrackedLink
                          href={addQueryParams(item.href, UTM_PARAMS)}
                          target="_blank"
                          rel="noopener"
                          event={ANALYTICS_EVENTS.TECH_STACK_CLICK}
                          eventProperties={{
                            section: ANALYTICS_SECTIONS.TECH_STACK,
                            tech: item.title,
                            key: item.key,
                            category,
                            url: item.href,
                          }}
                          className="flex h-(--badge-height) items-center justify-center gap-1.25 rounded-full bg-zinc-50/80 px-2 font-mono text-xs text-foreground inset-ring-1 inset-ring-border dark:bg-zinc-900/80 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground/80"
                        >
                          <TechStackItemIcon
                            icon={item.icon}
                            brandIcon={TECH_STACK_BRAND_ICONS[item.key]}
                          />
                          {item.title}
                        </TrackedLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          },
        )}
      </div>
    </Panel>
  );
}

function groupByCategory(
  items: TechStackType[],
): Record<string, TechStackType[]> {
  const grouped: Record<string, TechStackType[]> = {};

  for (const item of items) {
    for (const category of item.categories) {
      const bucket = grouped[category];
      if (bucket) {
        bucket.push(item);
      } else {
        grouped[category] = [item];
      }
    }
  }

  return grouped;
}
