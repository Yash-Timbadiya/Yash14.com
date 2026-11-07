import type { Activity } from "@/features/portfolio/components/contribution-graph";

import { Suspense } from "react";
import { USER } from "@/features/portfolio/data/user";
import { SectionHead, SectionIndex } from "./section-intro";
import { getProducts } from "@/features/home/lib/get-products";
import { SOCIAL } from "@/features/portfolio/data/social-links";
import { TECH_STACK } from "@/features/portfolio/data/tech-stack";
import { YTMarkIsometric } from "@/features/portfolio/components/yt-mark-isometric";
import { getGitHubContributions } from "@/features/portfolio/data/github-contributions";
import {
  ContributionField,
  ContributionFieldFallback,
} from "./contribution-field";
import {
  IconBolt,
  IconChevronRight,
  IconTargetArrow,
  IconUserFilled,
} from "@tabler/icons-react";

/** Splits a sentence into its lead and the rest, for the two-tone treatment. */
function splitLead(text: string): [string, string] {
  const dash = text.indexOf(" - ");
  if (dash !== -1) return [text.slice(0, dash), text.slice(dash + 1)];

  const stop = text.indexOf(". ");
  if (stop !== -1) return [text.slice(0, stop + 1), text.slice(stop + 2)];

  return [text, ""];
}

const ABOUT_PARAGRAPHS = USER.about
  .trim()
  .split("\n")
  .map((line) => line.replace(/^- /, "").trim())
  .filter(Boolean)
  .map(splitLead);

const YEARS_OF_EXPERIENCE = /(\d+\+?) years/.exec(USER.about)?.[1] ?? "2+";

const STAT_CLASS =
  "flex flex-col gap-3 border-line p-6 not-first:border-l max-lg:nth-[3]:border-l-0 max-lg:nth-[n+3]:border-t lg:px-7 lg:py-9";

function Stat({
  value,
  title,
  detail,
}: {
  value: string;
  title: string;
  detail: string;
}) {
  return (
    <div className={STAT_CLASS}>
      <dd className="home-stat-value">{value}</dd>
      <dt className="text-[0.9375rem]">{title}</dt>
      <dd className="-mt-2 text-[0.8125rem] text-(color:--ink-56)">{detail}</dd>
    </div>
  );
}

async function ContributionStat({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const days = await contributions;
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <Stat
      value={days.length > 0 ? total.toLocaleString("en") : "-"}
      title="Contributions"
      detail="In the past 365 days"
    />
  );
}

export function AboutSection() {
  const contributions = getGitHubContributions();
  const categories = new Set(TECH_STACK.flatMap((item) => item.categories));

  return (
    <section id="hello" className="scroll-mt-16">
      <SectionIndex index={1} label="Hello" />
      <SectionHead
        seed={7}
        icon={<IconUserFilled aria-hidden />}
        label="About me"
        title={
          <>
            Hello, I&rsquo;m <span className="home-heat">{USER.firstName}</span>
          </>
        }
        description={`${USER.flipSentences[1]} and ${USER.flipSentences[2]} in ${USER.address}.`}
      />

      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-2">
          <span className="home-star max-lg:hidden" aria-hidden />
          {ABOUT_PARAGRAPHS.map(([lead, rest], index) => (
            <article
              key={lead}
              className="flex flex-col gap-5 px-6 py-10 not-first:border-line max-lg:not-first:border-t lg:px-14 lg:py-14 lg:not-first:border-l"
            >
              <p className="flex items-center gap-2.5 text-[0.8125rem] text-(color:--ink-72)">
                {index === 0 ? (
                  <IconBolt className="size-4" aria-hidden />
                ) : (
                  <IconTargetArrow className="size-4" aria-hidden />
                )}
                {index === 0 ? "Who I am" : "What I focus on"}
              </p>
              <p className="home-feature-text">
                <strong>{lead}</strong> {rest}
              </p>
              <a
                className="home-link mt-auto w-fit"
                href={index === 0 ? "/cv" : SOCIAL.github.href}
                target={index === 0 ? undefined : "_blank"}
                rel={index === 0 ? undefined : "noopener"}
              >
                {index === 0 ? "View my CV" : "See my GitHub"}
                <IconChevronRight aria-hidden />
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 bg-(--surface) lg:border-r lg:border-line">
            <h3 className="sr-only">GitHub Contributions</h3>
            <Suspense fallback={<ContributionFieldFallback />}>
              <ContributionField contributions={contributions} />
            </Suspense>
          </div>

          <figure className="relative flex min-w-0 flex-col overflow-clip max-lg:border-t max-lg:border-line">
            <figcaption className="flex h-12 items-center justify-between gap-3 border-b border-line px-5">
              <span className="home-brackets text-(color:--ink-40)">
                [ <span className="home-heat">FIG_001</span> ]
              </span>
              <span className="home-mono-label truncate">Click the mark</span>
            </figcaption>
            <div className="@container my-auto px-4 py-6">
              <YTMarkIsometric />
            </div>
            <p className="home-mono-label flex h-11 items-center justify-end border-t border-line px-5">
              Right-click to switch rides
            </p>
          </figure>
        </div>
      </div>

      <div className="home-band">
        <dl className="home-frame grid grid-cols-2 lg:grid-cols-4">
          <Stat
            value={YEARS_OF_EXPERIENCE}
            title="Years of experience"
            detail={USER.jobTitle}
          />
          <Stat
            value={String(getProducts().length)}
            title="Products"
            detail="Built and maintained"
          />
          <Stat
            value={String(TECH_STACK.length)}
            title="Tools"
            detail={`Across ${categories.size} categories`}
          />
          <Suspense
            fallback={
              <Stat
                value="-"
                title="Contributions"
                detail="In the past 365 days"
              />
            }
          >
            <ContributionStat contributions={contributions} />
          </Suspense>
        </dl>
      </div>
    </section>
  );
}
