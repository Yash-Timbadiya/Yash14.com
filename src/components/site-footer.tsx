"use client";

import type { BuildInfo } from "@/lib/build-info";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { config } from "@/config";
import packageJson from "../../package.json";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { USER } from "@/features/portfolio/data/user";
import { LinkPreview } from "@/components/link-preview";
import { motion, useReducedMotion } from "motion/react";
import { getBuildInfo, getStack } from "@/lib/build-info";
import { YashSignature } from "@/components/yash-signature";
import { SOCIAL } from "@/features/portfolio/data/social-links";
import { SiteFooterLinks } from "@/components/site-footer-links";
import { LICENSE, SOURCE_CODE_GITHUB_URL, UTM_PARAMS } from "@/config/site";
import { SiteFooterInteractiveLogotype } from "@/components/site-footer-brand";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const POSTHOG_URL = "https://posthog.com";

const DMCA_URL = config.dmca.url;

const INSPIRED_BY = [
  "Tailwind CSS",
  "shadcn/ui",
  "Vercel",
  "Evil Charts",
  "Devouring Details",
  "Skiper UI",
  "Making Software",
  "shadcncraft",
];

const SITE_TITLE = "YASH14.COM";
const SITE_SUBTITLE = packageJson.description;

export function SiteFooter() {
  const xLink = SOCIAL.x;
  const shouldReduceMotion = useReducedMotion();
  const [signatureDrawKey, setSignatureDrawKey] = useState(0);

  const build = getBuildInfo();
  const stack = getStack();

  return (
    <footer className="max-w-screen overflow-x-clip px-2">
      <div className="screen-line-top mx-auto border-x border-line group-has-data-[slot=layout-wide]/layout:container md:max-w-4xl">
        <div className="screen-line-bottom h-1" />

        <div className="relative">
          <div className="screen-line-bottom flex flex-col items-start gap-x-4 gap-y-1 px-4 py-3 font-mono text-sm sm:flex-row sm:items-baseline sm:justify-between">
            <span className="font-medium">{SITE_TITLE}</span>
            <span className="font-sans text-muted-foreground">
              {SITE_SUBTITLE}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-line font-mono md:grid-cols-4">
            <Field label="Crafted by">
              {xLink ? (
                <LinkPreview
                  url={addQueryParams(xLink.href, UTM_PARAMS)}
                  className="link-underline"
                  onClick={() =>
                    trackEvent(ANALYTICS_EVENTS.REDIRECT_TO_X, {
                      section: ANALYTICS_SECTIONS.FOOTER,
                      source: ANALYTICS_SOURCES.CRAFTED_BY,
                      url: xLink.href,
                    })
                  }
                >
                  {xLink.handle}
                </LinkPreview>
              ) : null}
            </Field>

            <Field label="Protected by">
              {DMCA_URL ? (
                <LinkPreview
                  url={DMCA_URL}
                  className="link-underline"
                  onClick={() =>
                    trackEvent(ANALYTICS_EVENTS.VIEW_DMCA, {
                      section: ANALYTICS_SECTIONS.FOOTER,
                      url: DMCA_URL,
                    })
                  }
                >
                  DMCA
                </LinkPreview>
              ) : null}
            </Field>

            <Field label="Build">
              <BuildValue build={build} />
            </Field>

            <Field label="Date">
              <time dateTime={build.date}>{build.date}</time>
            </Field>

            <Field label="Deployed on">
              {shouldReduceMotion ? (
                <span className="font-sans" aria-hidden>
                  ▲
                </span>
              ) : (
                <motion.span
                  className="font-sans"
                  aria-hidden
                  style={{ display: "inline-block", willChange: "transform" }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ▲
                </motion.span>
              )}
              <span className="sr-only">Vercel</span>
            </Field>

            <Field label="Source code">
              <LinkPreview
                url={SOURCE_CODE_GITHUB_URL}
                className="link-underline"
                onClick={() =>
                  trackEvent(ANALYTICS_EVENTS.REDIRECT_TO_GITHUB, {
                    section: ANALYTICS_SECTIONS.FOOTER,
                    source: ANALYTICS_SOURCES.SOURCE_CODE,
                    url: SOURCE_CODE_GITHUB_URL,
                  })
                }
              >
                GitHub
              </LinkPreview>
            </Field>

            <Field label="License">
              <LinkPreview
                url={LICENSE.url}
                className="link-underline"
                onClick={() =>
                  trackEvent(ANALYTICS_EVENTS.VIEW_LICENSE, {
                    section: ANALYTICS_SECTIONS.FOOTER,
                    license: LICENSE.name,
                    url: LICENSE.url,
                  })
                }
              >
                {LICENSE.name}
              </LinkPreview>
            </Field>

            <Field label="Typeface">Geist</Field>

            <Field className="col-span-2" label="Stack">
              <ul className="flex flex-col gap-0.5">
                {stack.map((item) => (
                  <li
                    key={item.name}
                    className="w-fit transition-transform duration-200 hover:translate-x-0.5"
                  >
                    <a
                      className="link-underline"
                      href={addQueryParams(item.href, UTM_PARAMS)}
                      target="_blank"
                      rel="noopener"
                      onClick={() =>
                        trackEvent(ANALYTICS_EVENTS.TECH_STACK_CLICK, {
                          section: ANALYTICS_SECTIONS.FOOTER,
                          source: ANALYTICS_SOURCES.STACK,
                          tech: item.name,
                          version: item.version,
                          url: item.href,
                        })
                      }
                    >
                      {item.name}@{item.version}
                    </a>
                  </li>
                ))}
              </ul>
            </Field>

            <Field label="Analytics">
              <ul className="flex flex-col gap-0.5">
                <li className="w-fit transition-transform duration-200 hover:translate-x-0.5">
                  <LinkPreview
                    url={POSTHOG_URL}
                    className="link-underline"
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENTS.REDIRECT_TO_POSTHOG, {
                        section: ANALYTICS_SECTIONS.FOOTER,
                        url: POSTHOG_URL,
                      })
                    }
                  >
                    PostHog
                  </LinkPreview>
                </li>
                <li>Google Search Console</li>
              </ul>
            </Field>

            <Field label="For agents">
              <ul className="flex flex-col gap-0.5">
                <li className="w-fit transition-transform duration-200 hover:translate-x-0.5">
                  <a
                    className="link-underline"
                    href="/llms.txt"
                    target="_blank"
                    rel="noopener"
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENTS.VIEW_LLMS_TXT, {
                        section: ANALYTICS_SECTIONS.FOOTER,
                        source: ANALYTICS_SOURCES.FOR_AGENTS,
                      })
                    }
                  >
                    llms.txt
                  </a>
                </li>
                <li className="w-fit transition-transform duration-200 hover:translate-x-0.5">
                  <a
                    className="link-underline"
                    href="/index.md"
                    target="_blank"
                    rel="noopener"
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENTS.VIEW_INDEX_MD, {
                        section: ANALYTICS_SECTIONS.FOOTER,
                        source: ANALYTICS_SOURCES.FOR_AGENTS,
                      })
                    }
                  >
                    index.md
                  </a>
                </li>
              </ul>
            </Field>

            <Field className="col-span-2" label="Also inspired by">
              <ol className="-mx-4 grid grid-cols-2 gap-x-px gap-y-0.5 font-sans">
                {INSPIRED_BY.map((name, index) => (
                  <li className="flex gap-2 px-4" key={name}>
                    <span
                      className="font-mono text-muted-foreground/80"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {name}
                  </li>
                ))}
              </ol>
            </Field>

            <Field
              className="col-span-2"
              label="Approved by"
              onPointerEnter={() => {
                if (!shouldReduceMotion) setSignatureDrawKey((key) => key + 1);
              }}
            >
              <div className="flex h-full flex-col justify-end gap-2">
                <YashSignature
                  drawKey={signatureDrawKey}
                  className="ml-1 h-16 w-auto self-start text-blue-900 dark:text-foreground"
                />
                <span className="border-t border-line pt-2 font-sans text-sm/none font-medium tracking-wide uppercase transition-colors duration-200 group-hover:border-foreground/25">
                  {USER.displayName}
                </span>
              </div>
            </Field>
          </dl>
        </div>

        <div className="screen-line-top h-4" />

        <div className="screen-line-top pt-4">
          <figure className="relative mx-auto flex flex-col items-center px-4 text-center z-10 pb-3">
            <blockquote className="w-full text-center">
              <p className="font-serif italic tracking-tight text-lg sm:text-2xl md:text-3xl">
                “Learn continually. There‘s always{" "}
                <span className="bg-linear-to-r from-[#7182ff] via-[#3cff52] to-[#ff7a00] bg-clip-text text-transparent">
                  one more thing{" "}
                </span>{" "}
                to learn”
              </p>
            </blockquote>
            <figcaption className="mt-2 text-right text-sm opacity-85 flex flex-col items-center">
              ~ Steve Jobs
            </figcaption>
          </figure>
        </div>

        <div className="screen-line-top screen-line-bottom flex w-full before:z-1 after:z-1">
          <SiteFooterLinks />
        </div>

        {/* <div className="*:absolute *:z-2 *:flex *:size-2 *:border *:border-line *:bg-background">
          <div className="bottom-[-3.5px] left-[-4.5px]" />
          <div className="right-[-4.5px] bottom-[-3.5px]" />
        </div> */}
      </div>

      <div
        className={cn(
          "max-w-screen overflow-x-hidden bg-background px-2",
          "transition-shadow duration-300",
        )}
      >
        <div
          className="mx-auto flex items-center justify-center before:z-1 before:transition-[background-color] md:max-w-7xl"
          data-header-container
        >
          <SiteFooterInteractiveLogotype text="YASH 14" />
        </div>
      </div>
    </footer>
  );
}

function BuildValue({ build }: { build: BuildInfo }) {
  if (!build.commitShortSha) {
    return <span className="text-muted-foreground">unavailable</span>;
  }

  return (
    <>
      {build.commitUrl ? (
        <LinkPreview
          url={build.commitUrl}
          className="link-underline"
          onClick={() =>
            trackEvent(ANALYTICS_EVENTS.REDIRECT_TO_GITHUB, {
              section: ANALYTICS_SECTIONS.FOOTER,
              source: ANALYTICS_SOURCES.BUILD_COMMIT,
              url: build.commitUrl ?? null,
            })
          }
        >
          {build.commitShortSha}
        </LinkPreview>
      ) : (
        build.commitShortSha
      )}

      {build.environment !== "production" && (
        <span className="text-muted-foreground">
          {" "}
          ({build.environment === "development" ? "local" : build.environment})
        </span>
      )}
    </>
  );
}

function Field({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  label: string;
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex min-w-0 flex-col gap-1 bg-background px-4 py-3 transition-colors duration-200 hover:bg-muted/40",
        className,
      )}
    >
      <dt className="text-[0.625rem]/4 font-medium tracking-wider text-muted-foreground uppercase transition-colors duration-200 group-hover:text-foreground/80">
        {label}
      </dt>
      <dd className="flex-1 text-sm">{children}</dd>
    </div>
  );
}
