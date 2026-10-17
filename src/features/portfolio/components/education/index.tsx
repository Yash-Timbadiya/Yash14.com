import { EducationItem } from "./education-item";
import { TrackedLink } from "@/components/tracked-link";
import { EDUCATION } from "@/features/portfolio/data/education";
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy";
import {
  Panel,
  PanelHeader,
  PanelTitle,
} from "@/features/portfolio/components/panel";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const ID = "education";

export function Education() {
  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <TrackedLink
            href={`#${ID}`}
            event={ANALYTICS_EVENTS.VIEW_SECTION}
            eventProperties={{
              section: ANALYTICS_SECTIONS.EDUCATION,
              source: ANALYTICS_SOURCES.HEADING,
              target: ID,
            }}
          >
            Education
          </TrackedLink>
          <PanelTitleCopy id={ID} section={ANALYTICS_SECTIONS.EDUCATION} />
        </PanelTitle>
      </PanelHeader>

      {EDUCATION.map((item) => (
        <div
          key={item.id}
          id={`education-${item.id}`}
          className="screen-line-bottom scroll-mt-14 p-4 pr-2"
        >
          <EducationItem key={item.id} item={item} />
        </div>
      ))}
    </Panel>
  );
}
