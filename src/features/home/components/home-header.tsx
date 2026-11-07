import dynamic from "next/dynamic";
import { MAIN_NAV } from "@/config/site";
import { NavDesktop } from "@/components/nav-desktop";
import { Separator } from "@/components/ui/separator";
import { USER } from "@/features/portfolio/data/user";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrackedLink } from "@/components/tracked-link";
import { NavItemGitHub } from "@/components/nav-item-github";
import { SiteHeaderLogo } from "@/components/site-header-logo";
import { BrandColorsToggle } from "@/components/brand-colors-toggle";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

const BrandContextMenu = dynamic(
  () => import("@/components/brand-context-menu"),
);

const CommandMenu = dynamic(() => import("@/components/command-menu"));

const SECTION_LINKS = [
  { title: "Hello", href: "#hello" },
  { title: "Stack", href: "#stack" },
  { title: "Experience", href: "#experience" },
  { title: "Education", href: "#education" },
];

export function AnnouncementBar() {
  return (
    <div className="home-frame p-3 pb-2.5">
      <p className="home-announce">
        Open to my next role.
        <TrackedLink
          href="/cv"
          event={ANALYTICS_EVENTS.VIEW_CV}
          eventProperties={{ section: ANALYTICS_SECTIONS.HEADER }}
        >
          View my CV
        </TrackedLink>
      </p>
    </div>
  );
}

export function HomeHeader() {
  return (
    <header className="home-header">
      <div className="home-frame flex h-14 items-center gap-3 px-4 lg:h-18 lg:px-10">
        <BrandContextMenu section={ANALYTICS_SECTIONS.HEADER}>
          <span className="text-(--heat) [&_svg]:h-7">
            <SiteHeaderLogo href="/home" />
          </span>
        </BrandContextMenu>
        <span className="text-[1.0625rem] font-medium tracking-[-0.016em] max-sm:hidden">
          {USER.displayName}
        </span>

        <div className="mx-auto flex items-center gap-1">
          <nav
            className="flex items-center gap-1 max-xl:hidden"
            aria-label="Sections"
          >
            {SECTION_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.title}
              </a>
            ))}
          </nav>
          <NavDesktop items={MAIN_NAV} />
        </div>

        <div className="flex items-center max-sm:*:data-[slot=command-menu-trigger]:hidden">
          <Separator
            orientation="vertical"
            className="mr-2 max-sm:hidden data-vertical:h-5 data-vertical:self-center"
          />
          <CommandMenu section={ANALYTICS_SECTIONS.HEADER} enabledHotkeys />
          <Separator
            orientation="vertical"
            className="mx-2 max-sm:hidden data-vertical:h-5 data-vertical:self-center"
          />
          <NavItemGitHub />
          <Separator
            orientation="vertical"
            className="mx-2 data-vertical:h-5 data-vertical:self-center"
          />
          <BrandColorsToggle section={ANALYTICS_SECTIONS.HEADER} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
