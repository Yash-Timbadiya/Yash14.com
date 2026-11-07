import type { Education } from "@/features/portfolio/types/education";

import { cn } from "@/lib/utils";
import { ShowMore } from "./show-more";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { ExternalArrow } from "./hover-arrow";
import { IconSchoolFilled } from "@tabler/icons-react";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHead, SectionIndex } from "./section-intro";
import { EDUCATION } from "@/features/portfolio/data/education";
import { MarkdownLinkPreview } from "@/components/markdown-link-preview";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  parseDescription,
  parseLinkedItems,
  toMarkdownList,
} from "@/features/home/lib/parse-description";
import {
  BAND,
  CHIP,
  FEATURE_TEXT,
  FRAME,
  MONO_LABEL,
  PROSE,
  ROW_ARROW,
  ROW_LINK,
  ROW_SOFT,
} from "@/features/home/lib/styles";

/**
 * One school on the timeline. On wide screens a dashed rail runs down the
 * middle column (fading out after the last school) with a ring level with the
 * end year.
 */
const TIMELINE_STEP =
  "relative grid grid-cols-[minmax(0,1fr)] gap-4 pb-12 last:pb-0 lg:grid-cols-[9rem_2.5rem_minmax(0,1fr)] lg:gap-0 lg:before:absolute lg:before:top-2 lg:before:-bottom-2 lg:before:left-[calc(9rem+1.25rem-0.5px)] lg:before:w-px lg:before:bg-[linear-gradient(var(--line)_50%,transparent_50%)] lg:before:bg-size-[1px_6px] lg:last:before:bottom-auto lg:last:before:h-full lg:last:before:mask-[linear-gradient(black_60%,transparent)] lg:after:absolute lg:after:top-[0.4rem] lg:after:left-[calc(9rem+1.25rem-5px)] lg:after:size-2.5 lg:after:rounded-full lg:after:border-2 lg:after:border-heat lg:after:bg-paper";

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
            Where my journey <span className="text-heat">started</span>
          </>
        }
        description="From IIT-JEE preparation to a B.Tech in Information Technology."
      />

      <div className={BAND}>
        <ol className={cn(FRAME, "px-6 py-10 lg:p-14")}>
          {EDUCATION.map((item) => (
            <li key={item.id} className={TIMELINE_STEP}>
              {/* Wide screens stack end over start beside the rail; narrow
                  ones read the range left to right: start, then end. */}
              <div className="flex items-baseline gap-2 font-mono text-[0.875rem] text-ink/40 lg:flex-col lg:items-end lg:gap-1 lg:pr-1 lg:text-[1.5rem]/[1.1] lg:tracking-[-0.02em]">
                <span className="text-heat">{yearOf(item.period.end)}</span>
                <span className="max-lg:order-first">
                  {yearOf(item.period.start)}
                  <span className="lg:hidden">{" —"}</span>
                </span>
                <span className={cn(MONO_LABEL, "lg:mt-2")}>
                  {duration(item.period)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-5 lg:col-start-3">
                <h3 className={FEATURE_TEXT}>
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
        <li key={skill} className={CHIP}>
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
        <div className={PROSE}>
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
              <div className={PROSE}>
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
                    <p className={cn(MONO_LABEL, "mb-3")}>{section.heading}</p>
                  )}

                  {linked ? (
                    <ul className="flex flex-col gap-0.5">
                      {linked.map((project) => (
                        <li key={project.url}>
                          <TrackedLink
                            className={cn(
                              ROW_LINK,
                              ROW_SOFT,
                              "grid-cols-[minmax(0,1fr)_0.875rem] gap-x-6 px-3 py-3",
                            )}
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
                              <span className="mt-1 block text-[0.8125rem]/normal text-pretty text-ink/72">
                                {project.description}
                              </span>
                            </span>
                            <ExternalArrow
                              className={cn(ROW_ARROW, "self-start")}
                              aria-hidden
                            />
                          </TrackedLink>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={PROSE}>
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
