import { InsetFrame } from "./inset-frame";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { IconStackFilled } from "@tabler/icons-react";
import { TrackedLink } from "@/components/tracked-link";
import { BAND, FRAME } from "@/features/home/lib/styles";
import { SectionHead, SectionIndex } from "./section-intro";
import { TECH_STACK } from "@/features/portfolio/data/tech-stack";
import { groupByCategory } from "@/features/home/lib/group-by-category";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { TECH_STACK_BRAND_ICONS } from "@/features/portfolio/data/tech-stack-brand-icons";
import { TechStackItemIcon } from "@/features/portfolio/components/tech-stack-brand-icons";

export function StackSection() {
  const groups = Object.entries(groupByCategory(TECH_STACK));

  return (
    <section id="stack" className="scroll-mt-16">
      <SectionIndex index={2} label="Stack" />
      <SectionHead
        seed={23}
        icon={<IconStackFilled aria-hidden />}
        label="Stack"
        title={
          <>
            The stack I ship with <span className="text-heat">every day</span>
          </>
        }
        description={`${TECH_STACK.length} tools across ${groups.length} categories, from language to analytics.`}
      />

      <div className={BAND}>
        <div className={FRAME}>
          <InsetFrame>
            <dl>
              {groups.map(([category, items], index) => (
                <div
                  key={category}
                  className="grid grid-cols-[minmax(0,1fr)] border-t border-line first:border-t-0 md:grid-cols-[15rem_minmax(0,1fr)]"
                >
                  <dt className="flex items-baseline gap-2.5 px-6 pt-5 pb-1 text-[0.9375rem] md:items-center md:border-r md:border-dashed md:border-line md:py-5">
                    <span className="font-mono text-[0.875rem] text-ink/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{category}</span>
                  </dt>
                  <dd className="flex flex-wrap gap-2 px-6 pt-3 pb-5 md:px-5 md:py-4">
                    {items.map((item) => (
                      <TrackedLink
                        key={item.key}
                        className="inline-flex h-7.5 items-center gap-2 rounded-full border border-line bg-surface pr-3 pl-2 font-mono text-[0.8125rem] whitespace-nowrap text-ink transition-[border-color,background-color] duration-150 ease-out hover:border-hairline-strong hover:bg-ink/4 [&_:is(svg,img)]:size-4 [&_:is(svg,img)]:shrink-0"
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
                        <TechStackItemIcon
                          icon={item.icon}
                          brandIcon={TECH_STACK_BRAND_ICONS[item.key]}
                        />
                        {item.title}
                      </TrackedLink>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </InsetFrame>
        </div>
      </div>
    </section>
  );
}
