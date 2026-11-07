"use client";

import { cn } from "@/lib/utils";
import packageJson from "../../package.json";
import { SiteFooterLinks } from "@/components/site-footer-links";
import { SiteFooterDetails } from "@/components/site-footer-details";
import { SiteFooterInteractiveLogotype } from "@/components/site-footer-brand";

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

          <SiteFooterDetails typeface="Geist" inspiredBy={INSPIRED_BY} />
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
