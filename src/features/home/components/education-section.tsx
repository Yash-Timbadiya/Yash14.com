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
        <ol className="home-frame home-edu-timeline">
          {EDUCATION.map((item) => (
            <li key={item.id} className="home-edu-step">
              <div className="home-edu-years">
                <span>{yearOf(item.period.end)}</span>
                <span>{yearOf(item.period.start)}</span>
                <span className="home-mono-label">{duration(item.period)}</span>
              </div>
              <div className="home-edu-body">
                <h3 className="home-feature-text">
                  <strong>{item.school}.</strong>{" "}
                  {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}.
                </h3>
                <EducationNotes item={item} />
                <Skills skills={item.skills} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** "09.2021" -> months since year 0, for working out a duration. */
function toMonths(value: string) {
  const [month, year] = value.split(".").map(Number);
  return year * 12 + (month - 1);
}

function duration({ start, end }: Education["period"]) {
  if (!end) return "Ongoing";
  const months = toMonths(end) - toMonths(start);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [
    years > 0 && `${years} yr${years === 1 ? "" : "s"}`,
    rest > 0 && `${rest} mo`,
  ]
    .filter(Boolean)
    .join(" ");
}

const yearOf = (value?: string) => value?.split(".")[1] ?? "Now";

function Skills({ skills }: { skills?: string[] }) {
  if (!skills?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li key={skill} className="home-chip">
          {skill}
        </li>
      ))}
    </ul>
  );
}

/** The first bullet, with the rest of the description behind "Show details". */
export function EducationNotes({ item }: { item: Education }) {
  const eventProperties = {
    section: ANALYTICS_SECTIONS.EDUCATION,
    school: item.school,
  };
  const [summary, ...details] = item.description
    ? parseDescription(item.description)
    : [];
  const hiddenBullets = summary?.items.slice(1) ?? [];

  return (
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
                    <ul className="flex flex-col gap-0.5">
                      {linked.map((project) => (
                        <li key={project.url}>
                          <TrackedLink
                            className="home-row-link home-row-soft grid-cols-[minmax(0,1fr)_0.875rem] gap-x-6 px-3 py-3"
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
  );
}
