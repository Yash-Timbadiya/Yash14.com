import type { Education } from "@/features/portfolio/types/education";

import { ShowMore } from "./show-more";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHead, SectionIndex } from "./section-intro";
import { EDUCATION } from "@/features/portfolio/data/education";
import { MarkdownLinkPreview } from "@/components/markdown-link-preview";
import { IconArrowUpRight, IconSchoolFilled } from "@tabler/icons-react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  parseDescription,
  parseLinkedItems,
  toMarkdownList,
} from "@/features/home/lib/parse-description";

export function EducationSection() {
  return (
    <section id="education" className="scroll-mt-16">
      <SectionIndex index={4} label="Education" />
      <SectionHead
        seed={59}
        icon={<IconSchoolFilled aria-hidden />}
        label="Education"
        title={
          <>
            Where my journey <span className="home-heat">started</span>
          </>
        }
        description="From IIT-JEE preparation to a B.Tech in Information Technology."
      />

      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-2">
          <span className="home-star max-lg:hidden" aria-hidden />
          {EDUCATION.map((item) => (
            <EducationCell key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationCell({ item }: { item: Education }) {
  const eventProperties = {
    section: ANALYTICS_SECTIONS.EDUCATION,
    school: item.school,
  };
  const [summary, ...details] = item.description
    ? parseDescription(item.description)
    : [];
  const hiddenBullets = summary?.items.slice(1) ?? [];

  return (
    <article className="flex min-w-0 flex-col gap-5 border-line px-6 py-10 not-first:max-lg:border-t lg:px-14 lg:py-14 lg:nth-[n+3]:border-l">
      <p className="flex items-center gap-2.5 text-[0.8125rem] tabular-nums text-(color:--ink-72)">
        <IconSchoolFilled className="size-4" aria-hidden />
        {item.period.start} — {item.period.end ?? "Present"}
      </p>

      <h3 className="home-feature-text">
        <strong>{item.school}.</strong>{" "}
        {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}.
      </h3>

      <div>
        {summary && summary.items.length > 0 && (
          <div className="home-prose">
            <MarkdownLinkPreview eventProperties={eventProperties}>
              {toMarkdownList(summary.items.slice(0, 1))}
            </MarkdownLinkPreview>
          </div>
        )}

        {(hiddenBullets.length > 0 || details.length > 0) && (
          <ShowMore
            label="Show details"
            openEvent={ANALYTICS_EVENTS.EDUCATION_OPENED}
            closeEvent={ANALYTICS_EVENTS.EDUCATION_CLOSED}
            eventProperties={eventProperties}
          >
            <div className="pt-2">
              {hiddenBullets.length > 0 && (
                <div className="home-prose">
                  <MarkdownLinkPreview eventProperties={eventProperties}>
                    {toMarkdownList(hiddenBullets)}
                  </MarkdownLinkPreview>
                </div>
              )}

              {details.map((section) => {
                const linked = parseLinkedItems(section.items);

                return (
                  <div key={section.heading} className="mt-6">
                    {section.heading && (
                      <p className="home-mono-label mb-3">{section.heading}</p>
                    )}

                    {linked ? (
                      <ul className="border-t border-line">
                        {linked.map((project) => (
                          <li key={project.url}>
                            <TrackedLink
                              className="home-row-link grid-cols-[minmax(0,1fr)_0.875rem] gap-x-6 py-3"
                              href={addQueryParams(project.url, UTM_PARAMS)}
                              target="_blank"
                              rel="noopener"
                              event={ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK}
                              eventProperties={{
                                section: ANALYTICS_SECTIONS.EDUCATION,
                                url: project.url,
                              }}
                            >
                              <span>
                                <span className="block text-sm font-medium">
                                  {project.name}
                                </span>
                                <span className="mt-1 block text-[0.8125rem]/normal text-pretty text-(color:--ink-72)">
                                  {project.description}
                                </span>
                              </span>
                              <IconArrowUpRight
                                className="home-row-arrow self-start"
                                aria-hidden
                              />
                            </TrackedLink>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="home-prose">
                        <MarkdownLinkPreview eventProperties={eventProperties}>
                          {toMarkdownList(section.items)}
                        </MarkdownLinkPreview>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ShowMore>
        )}
      </div>

      {item.skills && item.skills.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {item.skills.map((skill) => (
            <li key={skill} className="home-chip">
              {skill}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
