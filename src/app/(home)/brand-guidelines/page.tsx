import type { Metadata } from "next";
import type { BrandColor } from "./color-swatch";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ColorSwatch } from "./color-swatch";
import { YTMark } from "@/components/yt-mark";
import { YTWordmark } from "@/components/yt-wordmark";
import { USER } from "@/features/portfolio/data/user";
import { TrackedLink } from "@/components/tracked-link";
import { BRAND_ASSETS, SITE_INFO } from "@/config/site";
import { CopyBrandSvgButton } from "./copy-brand-svg-button";
import { PageHeader } from "@/features/home/components/page-header";
import { IconDownload, IconPaletteFilled } from "@tabler/icons-react";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import {
  YTMarkClearSpace,
  YTWordmarkClearSpace,
} from "@/components/yt-clear-space";
import { LLMCopyButtonWithViewOptions } from "@/features/doc/components/doc-page-actions";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import {
  BAND,
  BTN,
  BTN_HEAT,
  BTN_SOFT,
  FRAME,
  MONO_LABEL,
} from "@/features/home/lib/styles";

const BrandContextMenu = dynamic(() =>
  import("@/components/brand-context-menu").then((mod) => mod.BrandContextMenu),
);

const SECTION = ANALYTICS_SECTIONS.BRAND_GUIDELINES;
const MARK_ASSET = "/assets/yash14-brand/yash14-mark.svg";
const LOGOTYPE_ASSET = "/assets/yash14-brand/yash14-logotype.svg";

const PAGE_TITLE = "Brand";
const PAGE_DESCRIPTION = `Logos, clear space and colors of the ${USER.displayName} identity, ready to download.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/brand-guidelines",
  },
  openGraph: {
    siteName: SITE_INFO.name,
    type: "website",
    locale: "en-IN",
    title: `${PAGE_TITLE} – ${SITE_INFO.name}`,
    description: PAGE_DESCRIPTION,
    url: "/brand-guidelines",
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_INFO.name,
      },
    ],
  },
};

const SECTIONS = [
  { id: "mark", title: "Mark" },
  { id: "logotype", title: "Logotype" },
  { id: "clear-space", title: "Clear space" },
  { id: "color", title: "Color" },
] as const;

/** How the logos sit on each brand color. Fixed values, so they read the same in either theme. */
const TILES = [
  {
    name: "Heat on Paper",
    className: "bg-[#f9f9f9] text-[#ff5400]",
    swatches: ["#ff5400", "#f9f9f9"],
  },
  {
    name: "Ink on Paper",
    className: "bg-[#f9f9f9] text-[#262626]",
    swatches: ["#262626", "#f9f9f9"],
  },
  {
    name: "Paper on Ink",
    className: "bg-[#262626] text-[#f9f9f9]",
    swatches: ["#f9f9f9", "#262626"],
  },
] as const;

const COLORS: BrandColor[] = [
  {
    name: "Heat",
    description:
      "The signature accent. Use it for the mark, highlights and the one action that matters on a screen.",
    hex: "#FF5400",
    rgb: "rgb(255, 84, 0)",
    hsl: "hsl(20, 100%, 50%)",
    sampleClassName: "bg-[#ff5400] text-white",
  },
  {
    name: "Ink",
    description:
      "Text and the monochrome mark. Use it on light surfaces to keep everything legible.",
    hex: "#262626",
    rgb: "rgb(38, 38, 38)",
    hsl: "hsl(0, 0%, 15%)",
    sampleClassName: "bg-[#262626] text-[#f9f9f9]",
  },
  {
    name: "Paper",
    description:
      "The quiet backdrop. Use it behind the mark and on dark surfaces for the reversed logo.",
    hex: "#F9F9F9",
    rgb: "rgb(249, 249, 249)",
    hsl: "hsl(0, 0%, 98%)",
    sampleClassName:
      "bg-[#f9f9f9] text-[#262626] shadow-[inset_0_-1px_0_var(--hairline)]",
  },
];

export default function BrandPage() {
  return (
    <>
      <PageHeader
        section={SECTION}
        seed={83}
        icon={<IconPaletteFilled aria-hidden />}
        label="Press & Brand"
        title={
          <>
            Brand <span className="text-heat">assets</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        actions={
          <>
            <LLMCopyButtonWithViewOptions
              markdownUrl="/brand.md"
              section={SECTION}
            />
            <DocShareMenu
              title={PAGE_TITLE}
              url="/brand-guidelines"
              section={SECTION}
            />
          </>
        }
      >
        <div className="mt-8 flex flex-col items-center gap-5">
          <TrackedLink
            className={cn(BTN, BTN_HEAT)}
            href={BRAND_ASSETS.url}
            download
            event={ANALYTICS_EVENTS.DOWNLOAD_BRAND_ASSETS}
            eventProperties={{
              section: SECTION,
              source: ANALYTICS_SOURCES.ASSET_BUTTONS,
              url: BRAND_ASSETS.url,
            }}
          >
            <IconDownload aria-hidden />
            Download all brand assets
          </TrackedLink>
          <nav
            aria-label="On this page"
            className={cn(
              MONO_LABEL,
              "flex flex-wrap justify-center gap-x-1 uppercase",
            )}
          >
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-2 py-1 transition-colors hover:bg-ink/4 hover:text-ink"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </PageHeader>

      <BrandSection
        index={1}
        id="mark"
        title="Mark"
        description="The YT mark on its own. Use it where space is square or tight: avatars, favicons and small placements. Do not stretch, rotate or recolor it beyond the tiles shown."
        actions={
          <AssetActions
            type="mark"
            href={MARK_ASSET}
            event={ANALYTICS_EVENTS.DOWNLOAD_MARK_SVG}
          />
        }
      >
        <LogoTiles>
          <YTMark className="h-14 w-auto" />
        </LogoTiles>
      </BrandSection>

      <BrandSection
        index={2}
        id="logotype"
        title="Logotype"
        description="The primary logo for most placements, with the name set beside the mark. Keep its proportions and give it room to breathe."
        actions={
          <AssetActions
            type="logotype"
            href={LOGOTYPE_ASSET}
            event={ANALYTICS_EVENTS.DOWNLOAD_LOGOTYPE_SVG}
          />
        }
      >
        <LogoTiles>
          <YTWordmark className="h-7 w-auto max-w-full" />
        </LogoTiles>
      </BrandSection>

      <BrandSection
        index={3}
        id="clear-space"
        title="Clear space"
        description="Keep a clear space of half the mark's height on every side, except where the logo stays clearly recognizable and legible."
      >
        {/* Heights rounded to whole pixels (from each viewBox) so the
            hairlines stay on the pixel grid. */}
        <div className="@container flex flex-col items-center justify-center gap-10 px-6 py-12 lg:px-12">
          <YTMarkClearSpace className="h-auto w-1/2 text-ink supports-[height:round(1px,1px)]:h-[round(down,calc(50cqw*530/660),1px)] sm:w-1/3 sm:supports-[height:round(1px,1px)]:h-[round(down,calc(33.3333cqw*530/660),1px)]" />
          <YTWordmarkClearSpace className="h-auto w-full text-ink supports-[height:round(1px,1px)]:h-[round(down,calc(100cqw*1050/5875),1px)]" />
        </div>
      </BrandSection>

      <BrandSection
        index={4}
        id="color"
        title="Color"
        description="Heat carries the identity; Ink and Paper give it a calm, neutral stage. Click any value to copy it."
      >
        <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-3 lg:gap-4 lg:p-6">
          {COLORS.map((color) => (
            <ColorSwatch key={color.name} color={color} />
          ))}
        </div>
      </BrandSection>
    </>
  );
}

/**
 * A numbered section: a full-width heading row (title and guidance, with the
 * section's downloads on the right), then its assets across the frame.
 */
function BrandSection({
  index,
  id,
  title,
  description,
  actions,
  children,
}: {
  index: number;
  id: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24" aria-labelledby={`${id}-title`}>
      <div className={BAND}>
        <div
          className={cn(
            FRAME,
            "flex flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-14 lg:py-14",
          )}
        >
          <div className="flex max-w-xl flex-col gap-3">
            <span className={cn(MONO_LABEL, "text-ink/24")}>
              [{" "}
              <span className="text-heat">
                {String(index).padStart(2, "0")}
              </span>{" "}
              ]
            </span>
            <h2
              id={`${id}-title`}
              className="text-[clamp(1.75rem,3vw,2.25rem)]/[1.1] font-medium tracking-[-0.022em]"
            >
              {title}
            </h2>
            <p className="text-[0.9375rem]/[1.6] text-pretty text-ink/72">
              {description}
            </p>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
      <div className={BAND}>
        <div className={cn(FRAME, "flex min-w-0 flex-col")}>{children}</div>
      </div>
    </section>
  );
}

/**
 * The logo on each brand color, as cards: a preview over a caption naming the
 * pairing and its two colors. Right-click any card to copy or download.
 */
function LogoTiles({ children }: { children: React.ReactNode }) {
  return (
    <BrandContextMenu section={SECTION}>
      <ul className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:gap-4 lg:p-6">
        {TILES.map((tile) => (
          <li
            key={tile.name}
            className="overflow-hidden rounded-xl border border-hairline"
          >
            <div
              className={cn(
                "flex aspect-[4/3] items-center justify-center px-8",
                tile.className,
              )}
            >
              {children}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3">
              <span className="text-[0.8125rem] font-medium">{tile.name}</span>
              <span className="flex -space-x-1" aria-hidden>
                {tile.swatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="size-3.5 rounded-full ring-1 ring-hairline-strong"
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </BrandContextMenu>
  );
}

function AssetActions({
  type,
  href,
  event,
}: {
  type: "mark" | "logotype";
  href: string;
  event:
    | typeof ANALYTICS_EVENTS.DOWNLOAD_MARK_SVG
    | typeof ANALYTICS_EVENTS.DOWNLOAD_LOGOTYPE_SVG;
}) {
  return (
    <div className="flex flex-col gap-2.5 lg:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <TrackedLink
          className={cn(BTN, BTN_SOFT, "h-9 px-3")}
          href={href}
          download
          event={event}
          eventProperties={{
            section: SECTION,
            source: ANALYTICS_SOURCES.ASSET_BUTTONS,
            url: href,
          }}
        >
          <IconDownload aria-hidden />
          SVG
        </TrackedLink>
        <CopyBrandSvgButton type={type} />
      </div>
      <span className={cn(MONO_LABEL, "max-sm:hidden")}>
        Right-click a tile for more
      </span>
    </div>
  );
}
