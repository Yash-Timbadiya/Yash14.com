import type { Experience } from "../../types/experiences";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { TrackedLink } from "@/components/tracked-link";
import { ExperiencePositionItem } from "./experience-position-item";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function ExperienceItem({ experience }: { experience: Experience }) {
  return (
    <div
      id={`experience-${experience.id}`}
      className="group/experience screen-line-bottom scroll-mt-14 space-y-4 py-4"
    >
      <div className="flex items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
            experience.largeLogo ? "h-6 w-10" : "size-6",
          )}
        >
          {experience.companyLogo ? (
            <Image
              src={experience.companyLogo}
              alt={`${experience.companyName} logo`}
              width={experience.largeLogo ? 40 : 24}
              height={experience.largeLogo ? 24 : 24}
              className={cn(
                "grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] group-hover/experience:grayscale-0 brand:grayscale-0",
                experience.largeLogo
                  ? "max-h-6 max-w-10 object-contain"
                  : "size-6 rounded-full object-cover",
                experience.invertLogoInLight && "invert dark:invert-0",
              )}
              style={
                experience.largeLogo
                  ? { width: "auto", height: "auto" }
                  : undefined
              }
              unoptimized
              aria-hidden
            />
          ) : (
            (experience.companyIcon ?? (
              <span className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            ))
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-x-3 gap-y-1 pr-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-xl/6 font-medium">
            {experience.companyWebsite ? (
              <TrackedLink
                className="link"
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
                {experience.companyName}
              </TrackedLink>
            ) : (
              experience.companyName
            )}
          </h3>

          {experience.location && experience.locationType && (
            <dl className="flex min-w-0 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
              <dt className="sr-only">Location</dt>
              <dd className="truncate">{experience.location}</dd>

              <dt className="sr-only">Location type</dt>
              <dd>({experience.locationType})</dd>

              {experience.isCurrentEmployer && (
                <>
                  <dt className="sr-only">Employment status</dt>
                  <dd>
                    <span className="sr-only">Current</span>
                    <span className="relative flex size-2.5 translate-x-px translate-y-px items-center justify-center">
                      <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-info opacity-50" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-info" />
                    </span>
                  </dd>
                </>
              )}
            </dl>
          )}
        </div>
      </div>

      <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
        {experience.positions.map((position) => (
          <ExperiencePositionItem
            key={position.id}
            position={position}
            companyName={experience.companyName}
          />
        ))}
      </div>
    </div>
  );
}
