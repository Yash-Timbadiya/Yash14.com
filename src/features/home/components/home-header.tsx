import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { MAIN_NAV } from "@/config/site";
import { FRAME } from "@/features/home/lib/styles";
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
  { title: "Hello", href: "/#hello" },
  { title: "Stack", href: "/#stack" },
  { title: "Experience", href: "/#experience" },
  { title: "Education", href: "/#education" },
];

export function AnnouncementBar() {
  return (
    <div className={cn(FRAME, "p-3 pb-2.5")}>
      <p className="flex min-h-10 flex-wrap items-center justify-center gap-x-1.5 rounded-[0.625rem] bg-heat px-4 py-2 text-center text-[0.875rem] font-medium text-on-heat [&_a]:underline [&_a]:underline-offset-2">
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
    <header className="sticky top-0 z-50 border-y border-hairline bg-paper [&_nav]:gap-1 [&_nav_a]:rounded-lg [&_nav_a]:px-2 [&_nav_a]:py-1.5 [&_nav_a]:text-[0.875rem] [&_nav_a]:font-normal [&_nav_a]:tracking-normal [&_nav_a]:text-ink [&_nav_a]:transition-[background-color] [&_nav_a]:duration-150 [&_nav_a:hover]:bg-ink/4">
      <div
        className={cn(
          FRAME,
          "flex h-14 items-center gap-3 px-4 lg:h-18 lg:px-10",
        )}
      >
        <BrandContextMenu section={ANALYTICS_SECTIONS.HEADER}>
          <span className="text-heat [&_svg]:h-7">
            <SiteHeaderLogo />
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
