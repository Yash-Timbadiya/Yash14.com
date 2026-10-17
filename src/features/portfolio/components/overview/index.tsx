import type { User } from "@/features/portfolio/types/user";

import { JobItem } from "./job-item";
import { urlToName } from "@/utils/url";
import { EmailItem } from "./email-item";
import { PhoneItem } from "./phone-item";
import { Panel, PanelContent } from "../panel";
import { USER } from "@/features/portfolio/data/user";
import { CurrentLocalTimeItem } from "./current-local-time-item";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item";
import {
  LinkIcon,
  MapPinIcon,
  MarsIcon,
  NonBinaryIcon,
  VenusIcon,
} from "lucide-react";

const LOCATION_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(USER.address)}`;

export function Overview() {
  return (
    <Panel className="screen-line-bottom-none">
      <h2 className="sr-only">Overview</h2>

      <PanelContent className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {USER.jobs.map((job) => {
          return (
            <JobItem
              key={`${job.title}-${job.company}`}
              title={job.title}
              company={job.company}
              website={job.website}
              experienceId={job.experienceId}
            />
          );
        })}

        <IntroItem>
          <IntroItemIcon>
            <MapPinIcon />
          </IntroItemIcon>
          <IntroItemContent>
            <IntroItemLink
              href={LOCATION_MAP_URL}
              aria-label={`Location: ${USER.address}`}
              event={ANALYTICS_EVENTS.VIEW_LOCATION_MAP}
              eventProperties={{
                section: ANALYTICS_SECTIONS.OVERVIEW,
                url: LOCATION_MAP_URL,
              }}
            >
              {USER.address}
            </IntroItemLink>
          </IntroItemContent>
        </IntroItem>

        <CurrentLocalTimeItem timeZone={USER.timeZone} />

        <PhoneItem phoneNumberB64={USER.phoneNumberB64} />

        <EmailItem emailB64={USER.emailB64} />

        <IntroItem>
          <IntroItemIcon>
            <LinkIcon />
          </IntroItemIcon>
          <IntroItemContent>
            <IntroItemLink
              href={USER.website}
              aria-label={`Personal website: ${urlToName(USER.website)}`}
              event={ANALYTICS_EVENTS.REDIRECT_TO_WEBSITE}
              eventProperties={{
                section: ANALYTICS_SECTIONS.OVERVIEW,
                url: USER.website,
              }}
            >
              {urlToName(USER.website)}
            </IntroItemLink>
          </IntroItemContent>
        </IntroItem>

        <IntroItem>
          <IntroItemIcon>{getGenderIcon(USER.gender)}</IntroItemIcon>
          <IntroItemContent aria-label={`Pronouns: ${USER.pronouns}`}>
            {USER.pronouns}
          </IntroItemContent>
        </IntroItem>
      </PanelContent>

      <div className="pointer-events-none absolute top-px bottom-0 left-1/2 -z-1 w-px -translate-x-2.25 bg-[linear-gradient(to_bottom,var(--line)_4px,transparent_2px)] bg-size-[1px_6px] bg-repeat-y max-sm:hidden" />
    </Panel>
  );
}

function getGenderIcon(gender: User["gender"]) {
  switch (gender) {
    case "male":
      return <MarsIcon />;
    case "female":
      return <VenusIcon />;
    case "non-binary":
      return <NonBinaryIcon />;
  }
}
