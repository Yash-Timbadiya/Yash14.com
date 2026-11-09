import type { Education } from "@/features/portfolio/types/education";

import { cn } from "@/lib/utils";
import { ShowMore } from "./show-more";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { ExternalArrow } from "./hover-arrow";
import { IconSchoolFilled } from "@tabler/icons-react";
import { TrackedLink } from "@/components/tracked-link";
import { MarkdownText } from "@/components/markdown-text";
import { SectionHead, SectionIndex } from "./section-intro";
import { EDUCATION } from "@/features/portfolio/data/education";
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
 * One school on the timeline. A dashed rail (fading out after the last school)
 * with a ring level with the dates: down the left edge on narrow screens, down
 * the middle column on wide ones.
 */
const TIMELINE_STEP = [
  "relative grid grid-cols-[minmax(0,1fr)] gap-3 pb-10 pl-7 last:pb-0 lg:grid-cols-[9rem_2.5rem_minmax(0,1fr)] lg:gap-0 lg:pb-12 lg:pl-0",
  "before:absolute before:top-2 before:-bottom-2 before:left-[calc(0.3125rem-0.5px)] before:w-px before:bg-[linear-gradient(var(--line)_50%,transparent_50%)] before:bg-size-[1px_6px] last:before:bottom-auto last:before:h-full last:before:mask-[linear-gradient(black_60%,transparent)] lg:before:left-[calc(9rem+1.25rem-0.5px)]",
  "after:absolute after:top-[0.3rem] after:left-0 after:size-2.5 after:rounded-full after:border-2 after:border-heat after:bg-paper lg:after:top-[0.4rem] lg:after:left-[calc(9rem+1.25rem-5px)]",
].join(" ");

/** Badges shown on phones before the rest collapse into a "+N" chip. */
const PHONE_SKILLS = 4;

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
        <ol className={cn(FRAME, "px-5 py-8 sm:px-6 sm:py-10 lg:p-14")}>
          {EDUCATION.map((item) => (
            <li key={item.id} className={TIMELINE_STEP}>
              {/* Wide screens stack end over start beside the rail; narrow
                  ones read the range left to right: start, then end. */}
              <div className="flex items-baseline gap-2 font-mono text-[0.8125rem] text-ink/40 lg:flex-col lg:items-end lg:gap-1 lg:pr-1 lg:text-[1.5rem]/[1.1] lg:tracking-[-0.02em]">
                <span className="text-heat">{yearOf(item.period.end)}</span>
                <span className="max-lg:order-first">
                  {yearOf(item.period.start)}
                  <span className="lg:hidden">{" —"}</span>
                </span>
                <span
                  className={cn(
                    MONO_LABEL,
                    "max-lg:before:mr-2 max-lg:before:content-['/'] lg:mt-2",
                  )}
                >
                  {duration(item.period)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-4 lg:col-start-3 lg:gap-5">
                <h3 className={FEATURE_TEXT}>
                  <strong className="max-lg:block">{item.school}.</strong>{" "}
                  <span className="max-lg:mt-1 max-lg:block max-lg:text-[0.9375rem]/[1.45]">
                    {[item.degree, item.fieldOfStudy]
                      .filter(Boolean)
                      .join(", ")}
                    .
                  </span>
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
      {skills.map((skill, index) => (
        <li
          key={skill}
          className={cn(CHIP, index >= PHONE_SKILLS && "max-sm:hidden")}
        >
          {skill}
        </li>
      ))}
      {skills.length > PHONE_SKILLS && (
        <li className={cn(CHIP, "text-ink/40 sm:hidden")}>
          +{skills.length - PHONE_SKILLS}
        </li>
      )}
    </ul>
  );
}

/** The whole description, collapsed behind "Show details". */
export function EducationNotes({ item }: { item: Education }) {
  const eventProperties = {
    section: ANALYTICS_SECTIONS.EDUCATION,
    school: item.school,
  };
  const [summary, ...details] = item.description
    ? parseDescription(item.description)
    : [];
  const hiddenBullets = summary?.items ?? [];

  return (
    <div>
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
                <MarkdownText eventProperties={eventProperties}>
                  {toMarkdownList(hiddenBullets)}
                </MarkdownText>
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
                      <MarkdownText eventProperties={eventProperties}>
                        {toMarkdownList(section.items)}
                      </MarkdownText>
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
