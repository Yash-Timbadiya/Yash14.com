import Link from "next/link";
import { AsciiField } from "./ascii-field";
import { addQueryParams } from "@/utils/url";
import { YTMark } from "@/components/yt-mark";
import packageJson from "../../../../package.json";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { SiteFooterLinks } from "@/components/site-footer-links";
import { SOURCE_CODE_GITHUB_URL, UTM_PARAMS } from "@/config/site";
import { SiteFooterDetails } from "@/components/site-footer-details";
import { SiteFooterInteractiveLogotype } from "@/components/site-footer-brand";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  SOCIAL_LINKS,
  SOCIAL_REDIRECT_EVENTS,
} from "@/features/portfolio/data/social-links";
import {
  IconArrowUpRight,
  IconBookmarkFilled,
  IconChevronRight,
  IconCode,
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

const SITE_LINKS = [
  { title: "Roast My Site", href: "/roast", icon: IconFlameFilled },
  { title: "Bookmarks", href: "/bookmarks", icon: IconBookmarkFilled },
  { title: "CV", href: "/cv", icon: IconFileTextFilled },
  {
    title: "Brand guidelines",
    href: "/brand-guidelines",
    icon: IconPaletteFilled,
  },
] as const;

const FOOTER_ROW =
  "home-row-link h-full grid-cols-[1.25rem_minmax(0,1fr)_0.875rem] items-center gap-x-3 px-6 py-4.5 lg:px-7 [&_svg:not(.home-row-arrow)]:size-5 [&_svg:not(.home-row-arrow)]:text-(color:--ink-56)";

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-band">
        <div className="home-frame home-gap" />
      </div>
      <div className="home-band">
        <div className="home-frame grid h-16 lg:h-22 lg:grid-cols-2">
          <p className="home-mono-label flex items-center px-6 uppercase lg:px-10">
            Footer
          </p>
          <div className="border-l border-line max-lg:hidden" />
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-2">
          <span className="home-star max-lg:hidden" aria-hidden />
          <div className="relative min-h-72 overflow-hidden border-line px-6 pt-10 max-lg:border-b lg:border-r lg:px-14 lg:pt-14">
            <div className="flex items-center gap-2.5">
              <YTMark className="h-7 text-(color:--heat)" />
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
              className="absolute inset-x-0 bottom-0 h-36 w-full text-(color:--heat) mask-[linear-gradient(to_top,black_30%,transparent)]"
            />
          </div>

          <ul className="grid min-w-0 content-start sm:grid-cols-2">
            {SOCIAL_LINKS.map((item) => (
              <li
                key={item.name}
                className="sm:even:border-l sm:even:border-line"
              >
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
                  <IconArrowUpRight className="home-row-arrow" aria-hidden />
                </TrackedLink>
              </li>
            ))}
            <li className="sm:even:border-l sm:even:border-line">
              <a
                className={FOOTER_ROW}
                href={SOURCE_CODE_GITHUB_URL}
                target="_blank"
                rel="noopener"
              >
                <IconCode aria-hidden />
                <span className="truncate text-sm">Source code</span>
                <IconArrowUpRight className="home-row-arrow" aria-hidden />
              </a>
            </li>
            {SITE_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <li
                  key={link.href}
                  className="sm:even:border-l sm:even:border-line"
                >
                  <Link className={FOOTER_ROW} href={link.href}>
                    <Icon aria-hidden />
                    <span className="truncate text-sm">{link.title}</span>
                    <IconChevronRight className="home-row-arrow" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame">
          <SiteFooterDetails typeface="Inter" inspiredBy={INSPIRED_BY} />
        </div>
      </div>

      <div className="home-band">
        <div className="home-frame flex justify-center">
          <SiteFooterLinks />
        </div>
      </div>

      <div className="home-band border-b-0">
        <div className="home-frame px-4 pb-16 sm:pb-0">
          <SiteFooterInteractiveLogotype text="YASH 14" />
        </div>
      </div>
    </footer>
  );
}
