import Link from "next/link";
import { cn } from "@/lib/utils";
import { AsciiField } from "./ascii-field";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { YTMark } from "@/components/yt-mark";
import packageJson from "../../../../package.json";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { ChevronRight, ExternalArrow } from "./hover-arrow";
import { SiteFooterLinks } from "@/components/site-footer-links";
import { SiteFooterDetails } from "@/components/site-footer-details";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { SiteFooterInteractiveLogotype } from "@/components/site-footer-brand";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  SOCIAL_LINKS,
  SOCIAL_REDIRECT_EVENTS,
} from "@/features/portfolio/data/social-links";
import {
  BAND,
  FRAME,
  GAP,
  MONO_LABEL,
  ROW_ARROW,
  ROW_LINK,
  STAR,
} from "@/features/home/lib/styles";
import {
  IconBookmarkFilled,
  IconFileTextFilled,
  IconFlameFilled,
  IconPaletteFilled,
} from "@tabler/icons-react";

const INSPIRED_BY = [
  "Firecrawl",
  "Linear",
  "Tailwind CSS",
  "shadcn/ui",
  "Vercel",
  "Evil Charts",
  "Devouring Details",
  "Skiper UI",
  "Making Software",
  "shadcncraft",
];

const CV_URL = "https://cv.yash14.com";

const SITE_LINKS = [
  { title: "Roast My Site", href: "/roast", icon: IconFlameFilled },
  { title: "Bookmarks", href: "/bookmarks", icon: IconBookmarkFilled },
  {
    title: "Brand guidelines",
    href: "/brand-guidelines",
    icon: IconPaletteFilled,
  },
] as const;

/** The leading icon is the row's first child; the trailing arrow keeps its own size. */
const FOOTER_ROW = cn(
  ROW_LINK,
  "h-full grid-cols-[1.25rem_minmax(0,1fr)_0.875rem] items-center gap-x-3 px-6 py-4.5 lg:px-7 [&>svg:first-child]:size-5 [&>svg:first-child]:text-ink/56",
);

export function HomeFooter() {
  return (
    <footer className="[&_dl]:bg-hairline">
      <div className={BAND}>
        <div className={cn(FRAME, GAP)} />
      </div>
      <div className={BAND}>
        <div className={cn(FRAME, "grid h-16 lg:h-22 lg:grid-cols-2")}>
          <p
            className={cn(
              MONO_LABEL,
              "flex items-center px-6 uppercase lg:px-10",
            )}
          >
            Footer
          </p>
          <div className="border-l border-line max-lg:hidden" />
        </div>
      </div>

      <div className={BAND}>
        <div className={cn(FRAME, "grid lg:grid-cols-2")}>
          <span className={cn(STAR, "max-lg:hidden")} aria-hidden />
          <div className="relative min-h-72 overflow-hidden border-line px-6 pt-10 max-lg:border-b lg:border-r lg:px-14 lg:pt-14">
            <div className="flex items-center gap-2.5">
              <YTMark className="h-7 text-heat" />
              <span className="text-[1.0625rem] font-medium tracking-[-0.016em]">
                {USER.displayName}
              </span>
            </div>
            <p className="mt-6 max-w-xs text-xl/7 tracking-[-0.012em]">
              {packageJson.description}
            </p>
            <AsciiField
              variant="terrain"
              seed={9}
              className="absolute inset-x-0 bottom-0 h-36 w-full text-heat mask-[linear-gradient(to_top,black_30%,transparent)]"
            />
          </div>

          {/* Outbound links in the left column, pages on this site in the right. */}
          <div className="grid min-w-0 content-start sm:grid-cols-2">
            <ul>
              {SOCIAL_LINKS.map((item) => (
                <li key={item.name}>
                  <TrackedLink
                    className={FOOTER_ROW}
                    href={addQueryParams(item.href, UTM_PARAMS)}
                    target="_blank"
                    rel="noopener"
                    event={SOCIAL_REDIRECT_EVENTS[item.name]}
                    eventProperties={{
                      section: ANALYTICS_SECTIONS.FOOTER,
                      url: item.href,
                    }}
                  >
                    {SOCIAL_ICONS[item.name]}
                    <span className="truncate text-sm" title={item.handle}>
                      {item.title}
                    </span>
                    <ExternalArrow className={ROW_ARROW} />
                  </TrackedLink>
                </li>
              ))}
              <li>
                <TrackedLink
                  className={FOOTER_ROW}
                  href={CV_URL}
                  target="_blank"
                  rel="noopener"
                  event={ANALYTICS_EVENTS.VIEW_CV}
                  eventProperties={{
                    section: ANALYTICS_SECTIONS.FOOTER,
                    url: CV_URL,
                  }}
                >
                  <IconFileTextFilled aria-hidden />
                  <span className="truncate text-sm">CV</span>
                  <ExternalArrow className={ROW_ARROW} />
                </TrackedLink>
              </li>
            </ul>

            <ul className="sm:border-l sm:border-line">
              {SITE_LINKS.map((link) => {
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link className={FOOTER_ROW} href={link.href}>
                      <Icon aria-hidden />
                      <span className="truncate text-sm">{link.title}</span>
                      <ChevronRight className={ROW_ARROW} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className={BAND}>
        <div className={FRAME}>
          <SiteFooterDetails typeface="Inter" inspiredBy={INSPIRED_BY} />
        </div>
      </div>

      <div className={BAND}>
        <div className={cn(FRAME, "flex justify-center")}>
          <SiteFooterLinks />
        </div>
      </div>

      <div className={cn(BAND, "border-b-0")}>
        <div className={cn(FRAME, "px-4 pb-16 sm:pb-0")}>
          <SiteFooterInteractiveLogotype text="YASH 14" />
        </div>
      </div>
    </footer>
  );
}
