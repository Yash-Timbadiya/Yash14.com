import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { HeroCells } from "./hero-cells";
import { RoastCard } from "./roast-card";
import { SparkIcon } from "./spark-icon";
import { SITE_INFO } from "@/config/site";
import { AsciiField } from "./ascii-field";
import { ConnectMenu } from "./connect-menu";
import { ProfileWindow } from "./profile-window";
import { USER } from "@/features/portfolio/data/user";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { VerifiedIcon } from "@/features/portfolio/components/verified-icon";
import { PronounceMyName } from "@/features/portfolio/components/pronounce-my-name";
import {
  BAND,
  BRACKETS,
  BTN,
  BTN_HEAT,
  BTN_SOFT,
  FRAME,
} from "@/features/home/lib/styles";

const WHATSAPP_MESSAGE = `Hi ${USER.firstName}, I came across your portfolio and would love to talk about working together.`;

const [FIRST_LINE, SECOND_LINE] = USER.bio.split(/(?<=\.)\s+/);

/** Sits in the first and last inner columns of the twelve between the rails. */
const TAGS = [
  { text: "[ INDIA ]", top: "1rem", side: "left" },
  { text: "[ IST ]", top: "1rem", side: "right" },
  { text: "[ .JSON ]", top: "calc(var(--cell) * 5 - 2rem)", side: "left" },
  { text: "[ .MD ]", top: "calc(var(--cell) * 5 - 2rem)", side: "right" },
] as const;

/** Fades each block up in turn; `--i` staggers the delay. */
const RISE =
  "motion-safe:animate-rise motion-safe:[animation-delay:calc(var(--i,0)*70ms)]";

/** A spark on the grid, where the clear space begins. */
const SPARK =
  "absolute top-(--cell) z-1 grid size-[2.875rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-paper/40 text-heat max-lg:hidden [&_svg]:size-[1.3125rem] motion-safe:[&_svg]:animate-spark";

function rise(index: number) {
  return { "--i": index } as CSSProperties;
}

export function HomeHero() {
  return (
    <section className="@container relative">
      {/* `--cell` is one of the twelve columns between the rails. */}
      <div className="relative [--cell:calc(min(100cqw_-_1.25rem,80rem)/12)] lg:h-[calc(var(--cell)*5)] lg:overflow-hidden">
        <HeroCells />
        {/* Sits low on both sides of the clear space. */}
        <AsciiField
          variant="terrain"
          seed={3}
          className="absolute top-[calc(var(--cell)*2.4)] bottom-0 left-1/2 z-0 h-[calc(var(--cell)*2.6)] w-[calc(var(--cell)*8)] -translate-x-1/2 text-ink/24 mask-[linear-gradient(to_top,black_40%,transparent)] max-lg:hidden"
        />

        <span
          className={SPARK}
          style={{ left: "calc(50% - var(--cell) * 4)" }}
          aria-hidden
        >
          <SparkIcon />
        </span>
        <span
          className={SPARK}
          style={{ left: "calc(50% + var(--cell) * 4)" }}
          aria-hidden
        >
          <SparkIcon />
        </span>

        {TAGS.map((tag) => (
          <span
            key={tag.text}
            className={cn(BRACKETS, "absolute z-1 max-lg:hidden")}
            style={{
              top: tag.top,
              [tag.side]: "calc(50% - var(--cell) * 6 + 1.125rem)",
            }}
            aria-hidden
          >
            {tag.text}
          </span>
        ))}

        {/* The copy sits in the clear space on wide screens and between the
            rails below that. The cells are too short to hold it above the
            overlapping roast card from 64rem to 72rem, so it sits a bit lower. */}
        <div className="relative z-1 mx-auto flex w-[calc(100%-1.25rem)] flex-col items-center border-x border-hairline px-4 pt-10 pb-14 text-center lg:absolute lg:top-(--cell) lg:bottom-0 lg:left-1/2 lg:m-0 lg:w-[calc(var(--cell)*8)] lg:-translate-x-1/2 lg:justify-end lg:border-0 lg:p-0 lg:pb-11 min-[72rem]:pb-13">
          <div
            className={cn(
              RISE,
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-hairline-strong bg-surface pr-3 pl-[0.4375rem] text-[0.9375rem] font-medium",
            )}
            style={rise(0)}
          >
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
                className="size-4 text-heat select-none"
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

          <h1
            className={cn(
              RISE,
              "mt-4 text-[clamp(2.5rem,11vw,4rem)] leading-[1.06] font-medium tracking-[-0.024em] text-balance lg:text-[length:calc(var(--cell)*0.6)]",
            )}
            style={rise(1)}
          >
            <span className="sr-only">{USER.displayName}: </span>
            <span className="block">{FIRST_LINE}</span>
            <span className="block text-heat">{SECOND_LINE}</span>
          </h1>

          <p
            className={cn(RISE, "mt-4 max-w-2xl text-base/6 text-pretty")}
            style={rise(2)}
          >
            {SITE_INFO.description}{" "}
            <span className="inline-block rounded-md bg-ink/6 px-1.5 whitespace-nowrap text-ink">
              {USER.flipSentences[2]}.
            </span>
          </p>

          <div
            className={cn(
              RISE,
              "mt-6 flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row sm:items-center",
            )}
            style={rise(3)}
          >
            <WhatsAppLink
              className={cn(BTN, BTN_HEAT)}
              message={WHATSAPP_MESSAGE}
            >
              Get in touch
            </WhatsAppLink>
            <ConnectMenu className={cn(BTN, BTN_SOFT)} />
          </div>
        </div>
      </div>

      <div className={BAND}>
        <div className={cn(FRAME, "px-2.5 lg:px-6")}>
          <div className={cn(RISE, "-mt-px px-1 lg:-mt-8")} style={rise(4)}>
            <RoastCard />
          </div>

          <ProfileWindow />
        </div>
      </div>
    </section>
  );
}
