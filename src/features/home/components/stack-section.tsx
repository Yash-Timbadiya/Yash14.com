import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { StackExplorer } from "./stack-explorer";
import { IconStackFilled } from "@tabler/icons-react";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHead, SectionIndex } from "./section-intro";
import { TECH_STACK } from "@/features/portfolio/data/tech-stack";
import { groupByCategory } from "@/features/portfolio/components/tech-stack";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { TECH_STACK_BRAND_ICONS } from "@/features/portfolio/data/tech-stack-brand-icons";
import { TechStackItemIcon } from "@/features/portfolio/components/tech-stack-brand-icons";

export function StackSection() {
  const groups = Object.entries(groupByCategory(TECH_STACK));

  const tiles = groups.flatMap(([category, items]) =>
    items.map((item) => ({
      key: item.key,
      category,
      node: (
        <TrackedLink
          className="home-tile"
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
        >
          <span className="home-tile-icon">
            <TechStackItemIcon
              icon={item.icon}
              brandIcon={TECH_STACK_BRAND_ICONS[item.key]}
            />
          </span>
          <span className="truncate">{item.title}</span>
        </TrackedLink>
      ),
    })),
  );

  return (
    <section id="stack" className="scroll-mt-16">
      <SectionIndex index={2} label="Stack" />
      <SectionHead
        seed={23}
        icon={<IconStackFilled aria-hidden />}
        label="Stack"
        title={
          <>
            The stack I ship with <span className="home-heat">every day</span>
          </>
        }
        description={`${TECH_STACK.length} tools across ${groups.length} categories, from language to analytics.`}
      />
      <StackExplorer categories={groups.map(([name]) => name)} tiles={tiles} />
    </section>
  );
}
