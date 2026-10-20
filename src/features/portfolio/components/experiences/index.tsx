import type { Experience } from "@/features/portfolio/types/experiences";

import { ChevronDownIcon } from "lucide-react";
import { ExperienceItem } from "./experience-item";
import { Button } from "@/components/base/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { BrandColorsScope } from "@/components/brand-colors-scope";
import { EXPERIENCES } from "@/features/portfolio/data/experiences";
import { CollapsibleTrigger } from "@/components/base/ui/collapsible";
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy";
import {
  Panel,
  PanelHeader,
  PanelTitle,
} from "@/features/portfolio/components/panel";
import {
  Collapsible,
  CollapsibleMotionContent,
} from "@/components/base/collapsible-animated";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const ID = "experience";
const MAX = 3;

export function Experiences() {
  return (
    <Panel id={ID}>
      <BrandColorsScope>
        <PanelHeader>
          <PanelTitle>
            <TrackedLink
              href={`#${ID}`}
              event={ANALYTICS_EVENTS.VIEW_SECTION}
              eventProperties={{
                section: ANALYTICS_SECTIONS.EXPERIENCE,
                source: ANALYTICS_SOURCES.HEADING,
                target: ID,
              }}
            >
              Experience
            </TrackedLink>
            <PanelTitleCopy id={ID} section={ANALYTICS_SECTIONS.EXPERIENCE} />
          </PanelTitle>
        </PanelHeader>

        <div className="pr-2 pl-4">
          <ExperienceList experiences={EXPERIENCES.slice(0, MAX)} />
        </div>

        {EXPERIENCES.length > MAX && (
          <Collapsible
            className="group/collapsible"
            openEvent={ANALYTICS_EVENTS.EXPERIENCE_SHOW_MORE}
            closeEvent={ANALYTICS_EVENTS.EXPERIENCE_SHOW_LESS}
            eventProperties={{
              section: ANALYTICS_SECTIONS.EXPERIENCE,
              hidden_count: EXPERIENCES.length - MAX,
            }}
          >
            <CollapsibleMotionContent className="pr-2 pl-4">
              <ExperienceList experiences={EXPERIENCES.slice(MAX)} />
            </CollapsibleMotionContent>

            <div className="-mt-px flex items-center justify-center py-4">
              <CollapsibleTrigger
                render={
                  <Button
                    className="gap-2 pr-2.5 pl-3 shadow-[inset_0_0_1px] shadow-foreground/20"
                    variant="secondary"
                    size="sm"
                  >
                    <span className="hidden group-data-closed/collapsible:block">
                      Show more
                    </span>

                    <span className="hidden group-data-open/collapsible:block">
                      Show less
                    </span>

                    <ChevronDownIcon className="group-data-open/collapsible:rotate-180" />
                  </Button>
                }
              />
            </div>
          </Collapsible>
        )}
      </BrandColorsScope>
    </Panel>
  );
}

function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <>
      {experiences.map((experience) => (
        <ExperienceItem key={experience.id} experience={experience} />
      ))}
    </>
  );
}
