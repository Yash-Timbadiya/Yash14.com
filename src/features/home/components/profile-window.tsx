import { cn } from "@/lib/utils";
import { urlToName } from "@/utils/url";
import { ProfileJson } from "./profile-json";
import { YTMark } from "@/components/yt-mark";
import { LinkIcon, MapPinIcon } from "lucide-react";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { BRACKETS, BTN, BTN_HEAT } from "@/features/home/lib/styles";
import { getGenderIcon } from "@/features/portfolio/components/overview";
import { JobItem } from "@/features/portfolio/components/overview/job-item";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { EmailItem } from "@/features/portfolio/components/overview/email-item";
import { PhoneItem } from "@/features/portfolio/components/overview/phone-item";
import {
  IconCircleCheckFilled,
  IconDownload,
  IconLock,
} from "@tabler/icons-react";
import { CurrentLocalTimeItem } from "@/features/portfolio/components/overview/current-local-time-item";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "@/features/portfolio/components/overview/intro-item";

const LOCATION_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(USER.address)}`;

/** A browser window: tab strip, address bar, then the profile beside its JSON. */
export function ProfileWindow() {
  return (
    <div className="mt-12 rounded-t-3xl border border-b-0 border-hairline px-1.5 pt-1.5 lg:mt-16">
      <div className="rounded-t-[1.125rem] border border-b-0 border-hairline bg-paper">
        <div className="flex h-12 items-end gap-4 pl-5">
          <WindowDots className="self-center" />
          {/* The tab's concave corners run its outline into the strip's
              bottom rule. */}
          <div className="relative z-1 -mb-px flex h-10 w-60 min-w-0 items-center gap-2.5 rounded-t-[0.875rem] border border-hairline border-b-surface bg-surface px-3.5 text-[0.8125rem] [--flare:0.75rem] before:absolute before:right-full before:-bottom-px before:size-(--flare) before:bg-[radial-gradient(circle_at_0_0,transparent_calc(var(--flare)-1px),var(--hairline)_calc(var(--flare)-1px),var(--hairline)_var(--flare),var(--surface)_var(--flare))] after:absolute after:-bottom-px after:left-full after:size-(--flare) after:bg-[radial-gradient(circle_at_100%_0,transparent_calc(var(--flare)-1px),var(--hairline)_calc(var(--flare)-1px),var(--hairline)_var(--flare),var(--surface)_var(--flare))]">
            <YTMark className="h-3 shrink-0 text-heat" aria-hidden />
            <span className="truncate">{USER.displayName}</span>
          </div>
        </div>

        {/* Sits on the window's own side borders, so its top edge curves into
            them instead of drawing a second line beside them. The inset's
            radius is the page's minus the gap and border, so the corners run
            parallel. */}
        <div className="-mx-px overflow-hidden rounded-t-[1.125rem] border border-b-0 border-hairline bg-surface px-1.5 pt-1.5">
          <div className="overflow-hidden rounded-t-[calc(1.125rem-0.375rem-1px)] border border-b-0 border-hairline">
            <div className="flex h-14 items-center gap-3 border-b border-line pr-2.5 pl-3 lg:pr-4 lg:pl-5">
              <span className="flex h-9 w-[min(100%,26rem)] min-w-0 items-center gap-2 rounded-full border border-hairline bg-paper px-3 text-[0.8125rem] text-ink/72 [&_svg]:text-ink/40">
                <IconLock className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{urlToName(USER.website)}</span>
              </span>
              <TrackedLink
                className={cn(
                  BTN,
                  BTN_HEAT,
                  "ml-auto h-8 shrink-0 gap-1.5 rounded-lg px-3 text-[13px]",
                )}
                href="/vcard"
                download=""
                event={ANALYTICS_EVENTS.DOWNLOAD_VCARD}
                eventProperties={{ section: ANALYTICS_SECTIONS.OVERVIEW }}
              >
                <IconDownload className="size-3.5" aria-hidden />
                vCard
              </TrackedLink>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="min-w-0 px-4 py-6 lg:px-8 lg:py-10">
                <ProfileDetails />
              </div>

              <div className="relative min-w-0 border-t border-hairline lg:mr-6 lg:border-x lg:border-t-0">
                <div className="flex h-12 items-center justify-between border-b border-line px-5">
                  <WindowDots />
                  <span className={BRACKETS}>
                    [ <span className="text-heat">.JSON</span> ]
                  </span>
                </div>
                <div className="overflow-x-auto pt-4 pb-5 font-mono text-[0.8125rem]/[1.125rem] tracking-normal">
                  <ProfileJson />
                </div>
                <span className="absolute right-4 bottom-4 inline-flex h-[1.875rem] items-center gap-2 rounded-full border border-hairline bg-surface pr-3 pl-[0.4375rem] font-mono text-[0.75rem] tracking-normal max-sm:hidden [&_svg]:size-[1.0625rem] [&_svg]:shrink-0 [&_svg]:text-heat">
                  <IconCircleCheckFilled aria-hidden />
                  Decoded in your browser
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowDots({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2 *:size-3 *:rounded-full *:border *:border-hairline-strong",
        className,
      )}
      aria-hidden
    >
      <span />
      <span />
      <span />
    </div>
  );
}

function ProfileDetails() {
  return (
    <dl className="flex flex-col gap-3">
      {USER.jobs.map((job) => (
        <SpecRow key={job.company} label="Role">
          <JobItem
            title={job.title}
            company={job.company}
            website={job.website}
          />
        </SpecRow>
      ))}

      <SpecRow label="Location">
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
      </SpecRow>

      <SpecRow label="Local time">
        <CurrentLocalTimeItem timeZone={USER.timeZone} />
      </SpecRow>

      <SpecRow label="Phone">
        <PhoneItem phoneNumberB64={USER.phoneNumberB64} />
      </SpecRow>

      <SpecRow label="Email">
        <EmailItem emailB64={USER.emailB64} />
      </SpecRow>

      <SpecRow label="Website">
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
      </SpecRow>

      <SpecRow label="Pronouns">
        <IntroItem>
          <IntroItemIcon>{getGenderIcon(USER.gender)}</IntroItemIcon>
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
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-4 text-[0.8125rem] max-sm:grid-cols-[minmax(0,1fr)] max-sm:gap-y-1 [&_[data-slot=intro-item]]:gap-2.5 [&_[data-slot=intro-item]]:text-[0.8125rem] [&_[data-slot=intro-item]]:tracking-normal">
      <dt className="justify-self-start rounded-md bg-ink/6 px-2 py-1 font-mono text-[0.75rem]/4 whitespace-nowrap text-ink/56">
        {label}
      </dt>
      <dd className="flex min-h-8 min-w-0 items-center">{children}</dd>
    </div>
  );
}
