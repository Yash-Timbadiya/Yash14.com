import { cn } from "@/lib/utils";
import { urlToName } from "@/utils/url";
import { ProfileJson } from "./profile-json";
import { YTMark } from "@/components/yt-mark";
import { LinkIcon, MapPinIcon } from "lucide-react";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { getGenderIcon } from "@/features/portfolio/components/overview";
import { JobItem } from "@/features/portfolio/components/overview/job-item";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { EmailItem } from "@/features/portfolio/components/overview/email-item";
import { PhoneItem } from "@/features/portfolio/components/overview/phone-item";
import { CurrentLocalTimeItem } from "@/features/portfolio/components/overview/current-local-time-item";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "@/features/portfolio/components/overview/intro-item";
import {
  IconBriefcaseFilled,
  IconCircleCheckFilled,
  IconDownload,
  IconLink,
  IconLock,
  IconMailFilled,
  IconMapPinFilled,
  IconPhoneFilled,
  IconUserFilled,
} from "@tabler/icons-react";

const LOCATION_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(USER.address)}`;

type DetailIcons = Record<
  "job" | "location" | "phone" | "email" | "website" | "pronouns",
  React.ReactNode
>;

const FILLED_ICONS: DetailIcons = {
  job: <IconBriefcaseFilled />,
  location: <IconMapPinFilled />,
  phone: <IconPhoneFilled />,
  email: <IconMailFilled />,
  website: <IconLink />,
  pronouns: <IconUserFilled />,
};

/** The outline set from `/`; job, phone and email fall back to their own defaults. */
const SITE_ICONS: DetailIcons = {
  job: undefined,
  location: <MapPinIcon />,
  phone: undefined,
  email: undefined,
  website: <LinkIcon />,
  pronouns: getGenderIcon(USER.gender),
};

/** Two side-by-side panes: profile rows and the same profile as JSON. */
export function ProfileWindow() {
  return (
    <div className="home-browser-outer mt-12 lg:mt-16">
      <div className="home-browser">
        <div className="grid lg:grid-cols-2">
          <div className="min-w-0 lg:border-r lg:border-line">
            <div className="flex h-12 items-center gap-4 border-b border-line pr-2 pl-5">
              <WindowDots />
              <span className="truncate text-[0.8125rem] text-(--ink-56)">
                {urlToName(USER.website)}
                <span className="text-foreground">/me</span>
              </span>
              <VCardLink />
            </div>
            <ProfileDetails />
          </div>

          <JsonPane className="relative min-w-0 max-lg:border-t max-lg:border-line" />
        </div>
      </div>
    </div>
  );
}

/** A full browser: tab strip, address bar, then the page split into two sections. */
export function ProfileBrowser() {
  return (
    <div className="home-browser-outer mt-12 lg:mt-16">
      <div className="home-browser">
        <div className="home-chrome-strip">
          <WindowDots />
          <div className="home-chrome-tab">
            <YTMark className="h-3 shrink-0 text-(--heat)" aria-hidden />
            <span className="truncate">{USER.displayName}</span>
          </div>
        </div>

        <div className="home-chrome-page">
          <div className="home-chrome-inset">
            <div className="flex h-14 items-center gap-3 border-b border-line pr-2.5 pl-3 lg:pr-4 lg:pl-5">
              <span className="home-chrome-address">
                <IconLock className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{urlToName(USER.website)}</span>
              </span>
              <VCardLink className="home-btn home-btn-heat h-8! gap-1.5! rounded-lg! px-3! text-[13px]!" />
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="min-w-0 px-4 py-6 lg:px-8 lg:py-10">
                <ProfileDetails
                  className="home-fields"
                  icons={SITE_ICONS}
                  shortcuts={false}
                />
              </div>

              <JsonPane className="home-chrome-pane" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowDots() {
  return (
    <div className="home-dots" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

function VCardLink({ className }: { className?: string }) {
  return (
    <TrackedLink
      className={cn(
        "ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] hover:bg-(--ink-4)",
        className,
      )}
      href="/vcard"
      download=""
      event={ANALYTICS_EVENTS.DOWNLOAD_VCARD}
      eventProperties={{
        section: ANALYTICS_SECTIONS.OVERVIEW,
      }}
    >
      <IconDownload className="size-3.5" aria-hidden />
      vCard
    </TrackedLink>
  );
}

function JsonPane({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="flex h-12 items-center justify-between border-b border-line px-5">
        <WindowDots />
        <span className="home-brackets text-(--ink-40)">
          [ <span className="home-heat">.JSON</span> ]
        </span>
      </div>
      <div className="home-json">
        <ProfileJson />
      </div>
      <span className="home-status-chip absolute right-4 bottom-4">
        <IconCircleCheckFilled aria-hidden />
        Decoded in your browser
      </span>
    </div>
  );
}

function ProfileDetails({
  className,
  icons = FILLED_ICONS,
  shortcuts = true,
}: {
  className?: string;
  icons?: DetailIcons;
  shortcuts?: boolean;
}) {
  return (
    <dl className={className}>
      {USER.jobs.map((job) => (
        <SpecRow key={job.company} label="Role">
          <JobItem
            title={job.title}
            company={job.company}
            website={job.website}
            icon={icons.job}
          />
        </SpecRow>
      ))}

      <SpecRow label="Location">
        <IntroItem>
          <IntroItemIcon>{icons.location}</IntroItemIcon>
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
      </SpecRow>

      <SpecRow label="Local time">
        <CurrentLocalTimeItem timeZone={USER.timeZone} />
      </SpecRow>

      <SpecRow label="Phone">
        <PhoneItem
          phoneNumberB64={USER.phoneNumberB64}
          icon={icons.phone}
          shortcuts={shortcuts}
        />
      </SpecRow>

      <SpecRow label="Email">
        <EmailItem
          emailB64={USER.emailB64}
          icon={icons.email}
          shortcuts={shortcuts}
        />
      </SpecRow>

      <SpecRow label="Website">
        <IntroItem>
          <IntroItemIcon>{icons.website}</IntroItemIcon>
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
      </SpecRow>

      <SpecRow label="Pronouns">
        <IntroItem>
          <IntroItemIcon>{icons.pronouns}</IntroItemIcon>
          <IntroItemContent aria-label={`Pronouns: ${USER.pronouns}`}>
            {USER.pronouns}
          </IntroItemContent>
        </IntroItem>
      </SpecRow>
    </dl>
  );
}

function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="home-spec-row">
      <dt>{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
