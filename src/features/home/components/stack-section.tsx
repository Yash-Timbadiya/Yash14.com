import { cn } from "@/lib/utils";
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

/** Niche tools left out on phones, so each category stays a few rows tall. */
const HIDDEN_ON_PHONE = new Set([
  "radixui",
  "base-ui",
  "expo",
  "tanstack",
  "zustand",
  "bun",
  "nginx",
  "trpc",
  "zod",
  "drizzle-orm",
  "neon",
  "planetscale",
  "supabase",
  "square",
  "dodo-payments",
  "authorize-net",
  "retell-ai",
  "telnyx",
  "gohighlevel",
  "klaviyo",
  "railway",
  "gemini",
  "chatgpt",
  "betterstack",
  "microsoft-clarity",
  "meta-pixel",
  "paper",
]);

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
          <InsetFrame className="max-md:p-0 max-md:[&>div]:border-0 max-md:[&>svg]:hidden">
            <dl>
              {groups.map(([category, items], index) => (
                <div
                  key={category}
                  className="grid grid-cols-[minmax(0,1fr)] border-t border-line first:border-t-0 md:grid-cols-[15rem_minmax(0,1fr)]"
                >
                  <dt className="flex items-baseline gap-2.5 px-4 pt-4 pb-1 text-[0.9375rem] sm:px-6 sm:pt-5 md:items-center md:border-r md:border-dashed md:border-line md:py-5">
                    <span className="font-mono text-[0.875rem] text-ink/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{category}</span>
                  </dt>
                  <dd className="flex flex-wrap gap-1.5 px-4 pt-2.5 pb-4 sm:gap-2 sm:px-6 sm:pt-3 sm:pb-5 md:px-5 md:py-4">
                    {items.map((item) => (
                      <TrackedLink
                        key={item.key}
                        className={cn(
                          "inline-flex h-6.5 items-center gap-1.5 rounded-full border border-line bg-surface pr-2.5 pl-1.5 font-mono text-[0.75rem] whitespace-nowrap text-ink transition-[border-color,background-color] duration-150 ease-out hover:border-hairline-strong hover:bg-ink/4 sm:h-7.5 sm:gap-2 sm:pr-3 sm:pl-2 sm:text-[0.8125rem] [&_:is(svg,img)]:size-3.5 [&_:is(svg,img)]:shrink-0 sm:[&_:is(svg,img)]:size-4",
                          HIDDEN_ON_PHONE.has(item.key) && "max-sm:hidden",
                        )}
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
