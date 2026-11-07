import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  BriefcaseBusinessIcon,
  CodeXmlIcon,
  LightbulbIcon,
} from "lucide-react";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item";

type JobItemProps = {
  title: string;
  company: string;
  website: string;
  experienceId?: string;
};

export function JobItem({
  title,
  company,
  website,
  experienceId,
}: JobItemProps) {
  return (
    <IntroItem className="sm:col-span-2">
      <IntroItemIcon>{getJobIcon(title)}</IntroItemIcon>

      <IntroItemContent>
        {title} <span aria-hidden="true">@</span>
        <span className="sr-only">at</span>
        <IntroItemLink
          className="ml-0.5 font-medium"
          {...(experienceId
            ? {
                href: `#experience-${experienceId}`,
                target: "_self",
                rel: "",
                event: ANALYTICS_EVENTS.VIEW_EXPERIENCE,
                eventProperties: {
                  section: ANALYTICS_SECTIONS.OVERVIEW,
                  company,
                },
              }
            : {
                href: addQueryParams(website, UTM_PARAMS),
                event: ANALYTICS_EVENTS.REDIRECT_TO_COMPANY,
                eventProperties: {
                  section: ANALYTICS_SECTIONS.OVERVIEW,
                  company,
                  url: website,
                },
              })}
        >
          {company}
        </IntroItemLink>
      </IntroItemContent>
    </IntroItem>
  );
}

function getJobIcon(title: string) {
  if (/(developer|engineer)/i.test(title)) {
    return <CodeXmlIcon />;
  }

  if (/(founder|co-founder)/i.test(title)) {
    return <LightbulbIcon />;
  }

  return <BriefcaseBusinessIcon />;
}
