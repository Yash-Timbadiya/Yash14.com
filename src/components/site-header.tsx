import type { DocPreview } from "@/features/doc/types/document";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MAIN_NAV } from "@/config/site";
import { YTMark } from "@/components/yt-mark";
import { NavDesktop } from "@/components/nav-desktop";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAllDocs } from "@/features/doc/data/documents";
import { NavItemGitHub } from "@/components/nav-item-github";

const BrandContextMenu = dynamic(
  () => import("@/components/brand-context-menu"),
);

const CommandMenu = dynamic(() => import("@/components/command-menu"));

export function SiteHeader() {
  const docs = getAllDocs();

  // Minimize data serialized to client component - only send necessary fields
  const docPreviews: DocPreview[] = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.metadata.title,
    category: doc.metadata.category,
  }));

  return (
    <header className="sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2 pt-(--header-pt) [--header-h:calc(var(--header-height)-var(--header-pt))] [--header-pt:--spacing(2)]">
      <div className="screen-line-top screen-line-bottom mx-auto flex h-(--header-h) items-center justify-between gap-2 border-x border-line px-2 group-has-data-[slot=layout-wide]/layout:container after:z-1 after:transition-[background-color] sm:gap-4 md:max-w-4xl">
        <BrandContextMenu>
          <Link href="/" aria-label="Home">
            <YTMark className="h-8 shrink-0" />
          </Link>
        </BrandContextMenu>

        <div className="flex-1" />

        <NavDesktop items={MAIN_NAV} />

        <div className="flex items-center *:first:mr-2 max-sm:*:data-[slot=command-menu-trigger]:hidden">
          <CommandMenu docs={docPreviews} enabledHotkeys />
          <NavItemGitHub />
          <Separator
            orientation="vertical"
            className="mx-2 data-vertical:h-4 data-vertical:self-center"
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
