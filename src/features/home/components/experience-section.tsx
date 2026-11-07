import type { Experience } from "@/features/portfolio/types/experiences";

import { cn } from "@/lib/utils";
import { ShowMore } from "./show-more";
import { StatusIcon } from "./status-icon";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { TrackedLink } from "@/components/tracked-link";
import { ExperienceExplorer } from "./experience-explorer";
import { SectionHead, SectionIndex } from "./section-intro";
import { EXPERIENCES } from "@/features/portfolio/data/experiences";
import { MarkdownLinkPreview } from "@/components/markdown-link-preview";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  IconArrowUpRight,
  IconBriefcaseFilled,
  IconChevronRight,
} from "@tabler/icons-react";
import { formatDuration } from "@/features/portfolio/components/experiences/experience-position-item";
import {
  parseDescription,
  parseLinkedItems,
  toMarkdownList,
} from "@/features/home/lib/parse-description";

/** Bullets shown per role before "Show more". */
const VISIBLE_BULLETS = 5;

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];

export function ExperienceSection() {
  const count = COUNT_WORDS[EXPERIENCES.length] ?? String(EXPERIENCES.length);

  const entries = EXPERIENCES.map((experience) => ({
    id: experience.id,
    tab: <CompanyTab experience={experience} />,
    panel: <CompanyPanel experience={experience} />,
  }));

  return (
    <section id="experience" className="scroll-mt-16">
      <SectionIndex index={3} label="Experience" />
      <SectionHead
        seed={41}
        icon={<IconBriefcaseFilled aria-hidden />}
        label="Experience"
        title={
          <>
            My work is split across{" "}
            <span className="home-heat">{count} places</span>
          </>
        }
        description="Telehealth platforms, SaaS products and marketing sites, shipped to production."
      />
      <ExperienceExplorer entries={entries} />
    </section>
  );
}

function CompanyTab({ experience }: { experience: Experience }) {
  const position = experience.positions[0];
  const { start, end } = position.employmentPeriod;

  return (
    <>
      <span className="home-usecase-name">
        <CompanyLogo experience={experience} />
        {experience.companyName}
      </span>
      <span className="text-[0.8125rem]/normal text-(color:--ink-72)">
        {position.title}
      </span>
      <span className="home-mono-label tabular-nums">
        {start} — {end ?? "Present"}
      </span>
    </>
  );
}

function CompanyPanel({ experience }: { experience: Experience }) {
  const place = [experience.location, experience.locationType]
    .filter(Boolean)
    .join(" · ");

  return (
    <article>
      {experience.positions.map((position) => {
        const { start, end } = position.employmentPeriod;
        const duration = formatDuration(start, end);
        const eventProperties = {
          section: ANALYTICS_SECTIONS.EXPERIENCE,
          company: experience.companyName,
          position: position.title,
        };
        const sections = position.description
          ? parseDescription(position.description)
          : [];
        const bullets = sections.find((section) => !section.heading);
        const products = sections.filter((section) => section !== bullets);
        const visible = bullets?.items.slice(0, VISIBLE_BULLETS) ?? [];
        const hidden = bullets?.items.slice(VISIBLE_BULLETS) ?? [];

        return (
          <div key={position.id}>
            <header className="flex min-h-15 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line px-6 py-3 lg:px-8">
              <h3 className="flex items-center gap-2.5 text-[0.9375rem] font-medium">
                <StatusIcon ongoing={!end} />
                {position.title}
              </h3>
              <p className="home-mono-label flex flex-wrap items-center gap-x-2 tabular-nums">
                {place && <span>{place} ·</span>}
                {duration && <span>{duration} ·</span>}
                {position.employmentType && (
                  <span>{position.employmentType}</span>
                )}
              </p>
            </header>

            <div className="home-prose px-6 py-6 lg:px-8">
              {visible.length > 0 && (
                <MarkdownLinkPreview eventProperties={eventProperties}>
                  {toMarkdownList(visible)}
                </MarkdownLinkPreview>
              )}

              {hidden.length > 0 && (
                <ShowMore
                  label={`Show ${hidden.length} more`}
                  openEvent={ANALYTICS_EVENTS.EXPERIENCE_POSITION_OPENED}
                  closeEvent={ANALYTICS_EVENTS.EXPERIENCE_POSITION_CLOSED}
                  eventProperties={eventProperties}
                >
                  <div className="pt-2">
                    <MarkdownLinkPreview eventProperties={eventProperties}>
                      {toMarkdownList(hidden)}
                    </MarkdownLinkPreview>
                  </div>
                </ShowMore>
              )}
            </div>

            {products.map((section) => {
              const linked = parseLinkedItems(section.items);
              if (!linked) return null;

              return (
                <div key={section.heading} className="border-t border-line">
                  <p className="home-mono-label border-b border-line px-6 py-3 lg:px-8">
                    {section.heading}
                  </p>
                  <ul>
                    {linked.map((item) => (
                      <li key={item.url}>
                        <TrackedLink
                          className="home-row-link grid-cols-[minmax(0,1fr)_0.875rem] items-center gap-x-6 px-6 py-3.5 sm:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_0.875rem] lg:px-8"
                          href={addQueryParams(item.url, UTM_PARAMS)}
                          target="_blank"
                          rel="noopener"
                          event={ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK}
                          eventProperties={{
                            section: ANALYTICS_SECTIONS.EXPERIENCE,
                            url: item.url,
                          }}
                        >
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="text-[0.8125rem]/normal text-pretty text-(color:--ink-72) max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-0.5">
                            {item.description}
                          </span>
                          <IconArrowUpRight
                            className="home-row-arrow"
                            aria-hidden
                          />
                        </TrackedLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <footer
              className={cn(
                "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-5 lg:px-8",
                products.length === 0 && "border-t border-line",
              )}
            >
              {position.skills && position.skills.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {position.skills.map((skill) => (
                    <li key={skill} className="home-chip">
                      {skill}
                    </li>
                  ))}
                </ul>
              )}
              {experience.companyWebsite && (
                <TrackedLink
                  className="home-link shrink-0"
                  href={addQueryParams(experience.companyWebsite, UTM_PARAMS)}
                  target="_blank"
                  rel="noopener"
                  event={ANALYTICS_EVENTS.REDIRECT_TO_COMPANY}
                  eventProperties={{
                    section: ANALYTICS_SECTIONS.EXPERIENCE,
                    company: experience.companyName,
                    url: experience.companyWebsite,
                  }}
                >
                  Visit site
                  <IconChevronRight aria-hidden />
                </TrackedLink>
              )}
            </footer>
          </div>
        );
      })}
    </article>
  );
}

function CompanyLogo({ experience }: { experience: Experience }) {
  if (experience.companyLogo) {
    return (
      <img
        className={cn(
          "h-5 w-auto max-w-9 object-contain select-none",
          experience.invertLogoInLight && "invert dark:invert-0",
        )}
        src={experience.companyLogo}
        alt=""
        width={experience.largeLogo ? 40 : 24}
        height={24}
        loading="lazy"
      />
    );
  }

  return (
    <span className="text-(color:--ink-56) [&_svg]:size-5" aria-hidden>
      {experience.companyIcon}
    </span>
  );
}
