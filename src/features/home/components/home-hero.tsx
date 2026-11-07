import type { CSSProperties } from "react";

import { urlToName } from "@/utils/url";
import { HeroCells } from "./hero-cells";
import { RoastCard } from "./roast-card";
import { SparkIcon } from "./spark-icon";
import { SITE_INFO } from "@/config/site";
import { AsciiField } from "./ascii-field";
import { ConnectMenu } from "./connect-menu";
import { ProfileJson } from "./profile-json";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { JobItem } from "@/features/portfolio/components/overview/job-item";
import { VerifiedIcon } from "@/features/portfolio/components/verified-icon";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { EmailItem } from "@/features/portfolio/components/overview/email-item";
import { PhoneItem } from "@/features/portfolio/components/overview/phone-item";
import { PronounceMyName } from "@/features/portfolio/components/pronounce-my-name";
import { CurrentLocalTimeItem } from "@/features/portfolio/components/overview/current-local-time-item";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "@/features/portfolio/components/overview/intro-item";
import {
  IconBriefcaseFilled,
  IconDownload,
  IconLink,
  IconMailFilled,
  IconMapPinFilled,
  IconPhoneFilled,
  IconUserFilled,
} from "@tabler/icons-react";

const LOCATION_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(USER.address)}`;

const WHATSAPP_MESSAGE = `Hi ${USER.firstName}, I came across your portfolio and would love to talk about working together.`;

const [FIRST_LINE, SECOND_LINE] = USER.bio.split(/(?<=\.)\s+/);

/** Sits in the first and last inner columns of the twelve between the rails. */
const TAGS = [
  { text: "[ INDIA ]", top: "1rem", side: "left" },
  { text: "[ IST ]", top: "1rem", side: "right" },
  { text: "[ .JSON ]", top: "calc(var(--cell) * 5 - 2rem)", side: "left" },
  { text: "[ .MD ]", top: "calc(var(--cell) * 5 - 2rem)", side: "right" },
] as const;

function rise(index: number) {
  return { "--i": index } as CSSProperties;
}

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-stage">
        <HeroCells />
        <AsciiField variant="terrain" seed={3} className="home-hero-ascii" />

        <span
          className="home-spark"
          style={{ left: "calc(50% - var(--cell) * 4)" }}
          aria-hidden
        >
          <SparkIcon />
        </span>
        <span
          className="home-spark"
          style={{ left: "calc(50% + var(--cell) * 4)" }}
          aria-hidden
        >
          <SparkIcon />
        </span>

        {TAGS.map((tag) => (
          <span
            key={tag.text}
            className="home-hero-tag home-brackets"
            style={{
              top: tag.top,
              [tag.side]: "calc(50% - var(--cell) * 6 + 1.125rem)",
            }}
            aria-hidden
          >
            {tag.text}
          </span>
        ))}

        <div className="home-hero-copy">
          <div className="home-pill home-rise" style={rise(0)}>
            <img
              className="size-7 rounded-full object-cover select-none"
              src={USER.avatarThumb}
              alt=""
              width={320}
              height={320}
              fetchPriority="high"
            />
            <a className="flex items-center gap-1.5" href="#hello">
              <span>{USER.displayName}</span>
              <VerifiedIcon
                className="size-4 select-none text-(color:--heat)"
                aria-hidden
              />
            </a>
            {USER.namePronunciationUrl && (
              <PronounceMyName
                className="[&_svg]:size-4"
                namePronunciationUrl={USER.namePronunciationUrl}
              />
            )}
          </div>

          <h1 className="home-h1 home-rise mt-4" style={rise(1)}>
            <span className="sr-only">{USER.displayName}: </span>
            <span className="block">{FIRST_LINE}</span>
            <span className="home-heat block">{SECOND_LINE}</span>
          </h1>

          <p
            className="home-rise mt-4 max-w-2xl text-base/6 text-pretty"
            style={rise(2)}
          >
            {SITE_INFO.description}{" "}
            <span className="home-chip-highlight">
              {USER.flipSentences[2]}.
            </span>
          </p>

          <div
            className="home-rise mt-6 flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row sm:items-center"
            style={rise(3)}
          >
            <WhatsAppLink
              className="home-btn home-btn-heat"
              message={WHATSAPP_MESSAGE}
            >
              Get in touch
            </WhatsAppLink>
            <ConnectMenu className="home-btn home-btn-soft" />
          </div>
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame px-2.5 lg:px-6">
          <div className="home-rise -mt-px px-1 lg:-mt-8" style={rise(4)}>
            <RoastCard />
          </div>

          <div className="home-browser-outer mt-12 lg:mt-16">
            <div className="home-browser">
              <div className="grid lg:grid-cols-2">
                <div className="min-w-0 lg:border-r lg:border-line">
                  <div className="flex h-12 items-center gap-4 border-b border-line pr-2 pl-5">
                    <div className="home-dots" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="truncate text-[0.8125rem] text-(color:--ink-56)">
                      {urlToName(USER.website)}
                      <span className="text-foreground">/me</span>
                    </span>
                    <TrackedLink
                      className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] hover:bg-(--ink-4)"
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
                  </div>

                  <dl>
                    {USER.jobs.map((job) => (
                      <SpecRow key={job.company} label="Role">
                        <JobItem
                          title={job.title}
                          company={job.company}
                          website={job.website}
                          experienceId={job.experienceId}
                          icon={<IconBriefcaseFilled />}
                        />
                      </SpecRow>
                    ))}

                    <SpecRow label="Location">
                      <IntroItem>
                        <IntroItemIcon>
                          <IconMapPinFilled />
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
                      <PhoneItem
                        phoneNumberB64={USER.phoneNumberB64}
                        icon={<IconPhoneFilled />}
                      />
                    </SpecRow>

                    <SpecRow label="Email">
                      <EmailItem
                        emailB64={USER.emailB64}
                        icon={<IconMailFilled />}
                      />
                    </SpecRow>

                    <SpecRow label="Website">
                      <IntroItem>
                        <IntroItemIcon>
                          <IconLink />
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
                        <IntroItemIcon>
                          <IconUserFilled />
                        </IntroItemIcon>
                        <IntroItemContent
                          aria-label={`Pronouns: ${USER.pronouns}`}
                        >
                          {USER.pronouns}
                        </IntroItemContent>
                      </IntroItem>
                    </SpecRow>
                  </dl>
                </div>

                <div className="relative min-w-0 max-lg:border-t max-lg:border-line">
                  <div className="flex h-12 items-center justify-between border-b border-line px-5">
                    <div className="home-dots" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="home-brackets text-(color:--ink-40)">
                      [ <span className="home-heat">.JSON</span> ]
                    </span>
                  </div>
                  <div className="home-json">
                    <ProfileJson />
                  </div>
                  <span className="home-status-chip absolute right-4 bottom-4">
                    <span className="size-1.5 rounded-full bg-(--heat)" />
                    Decoded in your browser
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
