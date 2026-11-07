import type { CSSProperties } from "react";

import { HeroCells } from "./hero-cells";
import { RoastCard } from "./roast-card";
import { SparkIcon } from "./spark-icon";
import { SITE_INFO } from "@/config/site";
import { AsciiField } from "./ascii-field";
import { ConnectMenu } from "./connect-menu";
import { USER } from "@/features/portfolio/data/user";
import { ProfileBrowser, ProfileWindow } from "./profile-window";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { VerifiedIcon } from "@/features/portfolio/components/verified-icon";
import { PronounceMyName } from "@/features/portfolio/components/pronounce-my-name";

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
                className="size-4 select-none text-(--heat)"
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

          <ProfileWindow />
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame px-2.5 lg:px-6">
          <ProfileBrowser />
        </div>
      </div>
    </section>
  );
}
