import { cn } from "@/lib/utils";
import { AsciiField } from "./ascii-field";
import { HoverArrow } from "./hover-arrow";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  BAND,
  BRACKETS,
  BTN,
  BTN_HEAT,
  BTN_SOFT,
  FRAME,
  GAP,
  H2,
} from "@/features/home/lib/styles";

const WHATSAPP_MESSAGE = `Hi ${USER.firstName}, I came across your portfolio and would love to talk about working together.`;

/** The closing call to action, between two ASCII renderings of the mark. */
export function CtaSection() {
  return (
    <>
      <div className={BAND}>
        <div className={cn(FRAME, GAP)} />
      </div>
      <section className={BAND}>
        <div
          className={cn(
            FRAME,
            "grid lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)_minmax(0,1fr)]",
          )}
        >
          <div className="relative border-r border-line max-lg:hidden">
            <span
              className={cn(BRACKETS, "absolute bottom-4 left-5")}
              aria-hidden
            >
              [ LEARN ]
            </span>
            <AsciiField
              variant="mark"
              seed={2}
              className="absolute inset-0 size-full text-heat"
            />
          </div>

          <figure className="flex flex-col items-center px-6 py-16 text-center lg:py-24">
            <blockquote>
              <p className={H2}>
                Learn continually. There&rsquo;s always{" "}
                <span className="text-heat">one more thing</span> to learn
              </p>
            </blockquote>
            <figcaption className="mt-4 text-base/6 text-ink/72">
              Steve Jobs
            </figcaption>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <WhatsAppLink
                className={cn(BTN, BTN_HEAT)}
                message={WHATSAPP_MESSAGE}
              >
                Get in touch
              </WhatsAppLink>
              <TrackedLink
                className={cn(BTN, BTN_SOFT)}
                href="/cv"
                event={ANALYTICS_EVENTS.VIEW_CV}
                eventProperties={{ section: ANALYTICS_SECTIONS.FOOTER }}
              >
                View my CV
              </TrackedLink>
            </div>

            <a
              className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] text-ink/56 transition-colors hover:text-foreground"
              href="/llms.txt"
              target="_blank"
              rel="noopener"
            >
              Are you an AI agent? Read llms.txt
              <HoverArrow />
            </a>
          </figure>

          <div className="relative border-l border-line max-lg:hidden">
            <span
              className={cn(BRACKETS, "absolute right-5 bottom-4")}
              aria-hidden
            >
              [ BUILD ]
            </span>
            <AsciiField
              variant="mark"
              seed={5}
              className="absolute inset-0 size-full text-heat"
            />
          </div>
        </div>
      </section>
    </>
  );
}
