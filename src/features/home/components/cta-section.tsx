import { AsciiField } from "./ascii-field";
import { USER } from "@/features/portfolio/data/user";
import { IconChevronRight } from "@tabler/icons-react";
import { TrackedLink } from "@/components/tracked-link";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

const WHATSAPP_MESSAGE = `Hi ${USER.firstName}, I came across your portfolio and would love to talk about working together.`;

/** The closing call to action, between two ASCII renderings of the mark. */
export function CtaSection() {
  return (
    <>
      <div className="home-band">
        <div className="home-frame home-gap" />
      </div>
      <section className="home-band">
        <div className="home-frame grid lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)_minmax(0,1fr)]">
          <div className="relative border-r border-line max-lg:hidden">
            <span
              className="home-brackets absolute bottom-4 left-5"
              aria-hidden
            >
              [ LEARN ]
            </span>
            <AsciiField
              variant="mark"
              seed={2}
              className="absolute inset-0 size-full text-(color:--heat)"
            />
          </div>

          <figure className="flex flex-col items-center px-6 py-16 text-center lg:py-24">
            <blockquote>
              <p className="home-h2">
                Learn continually. There&rsquo;s always{" "}
                <span className="home-heat">one more thing</span> to learn
              </p>
            </blockquote>
            <figcaption className="mt-4 text-base/6 text-(color:--ink-72)">
              Steve Jobs
            </figcaption>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <WhatsAppLink
                className="home-btn home-btn-heat"
                message={WHATSAPP_MESSAGE}
              >
                Get in touch
              </WhatsAppLink>
              <TrackedLink
                className="home-btn home-btn-soft"
                href="/cv"
                event={ANALYTICS_EVENTS.VIEW_CV}
                eventProperties={{ section: ANALYTICS_SECTIONS.FOOTER }}
              >
                View my CV
              </TrackedLink>
            </div>

            <a
              className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] text-(color:--ink-56) transition-colors hover:text-foreground"
              href="/llms.txt"
              target="_blank"
              rel="noopener"
            >
              Are you an AI agent? Read llms.txt
              <IconChevronRight className="size-3.5" aria-hidden />
            </a>
          </figure>

          <div className="relative border-l border-line max-lg:hidden">
            <span
              className="home-brackets absolute right-5 bottom-4"
              aria-hidden
            >
              [ BUILD ]
            </span>
            <AsciiField
              variant="mark"
              seed={5}
              className="absolute inset-0 size-full text-(color:--heat)"
            />
          </div>
        </div>
      </section>
    </>
  );
}
