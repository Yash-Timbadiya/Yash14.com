import type React from "react";
import type { Metadata } from "next";
import type { TOCItemType } from "@/components/toc";

import Link from "next/link";
import dynamic from "next/dynamic";
import { YTMark } from "@/components/yt-mark";
import { Button } from "@/components/ui/button";
import { TOCMinimap } from "@/components/toc-minimap";
import { YTWordmark } from "@/components/yt-wordmark";
import { USER } from "@/features/portfolio/data/user";
import { BRAND_ASSETS, SITE_INFO } from "@/config/site";
import { CopyBrandSvgButton } from "./copy-brand-svg-button";
import { ArrowLeftIcon, Download, LinkIcon } from "lucide-react";
import { DocPageRoot } from "@/features/doc/components/doc-page-root";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import {
  YTMarkClearSpace,
  YTWordmarkClearSpace,
} from "@/components/yt-clear-space";
import { LLMCopyButtonWithViewOptions } from "@/features/doc/components/doc-page-actions";
import {
  DocContainer,
  DocGrid,
  DocLeftCol,
  DocRightCol,
} from "@/features/doc/components/doc-layout";
import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@/features/portfolio/components/panel";

const BrandContextMenu = dynamic(() =>
  import("@/components/brand-context-menu").then((mod) => mod.BrandContextMenu),
);

const MARK_ASSET = "/assets/yash14-brand/yash14-mark.svg";
const LOGOTYPE_ASSET = "/assets/yash14-brand/yash14-logotype.svg";

const PAGE_TITLE = "YT Brand";
const PAGE_DESCRIPTION = `Key elements of the ${USER.displayName} visual identity, including the mark, logotype, clear space, and color.`;

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

const TOC_ITEMS: TOCItemType[] = [
  { title: "Mark", url: "#mark", depth: 2 },
  { title: "Logotype", url: "#logotype", depth: 2 },
  { title: "Clear Space", url: "#clear-space", depth: 2 },
  { title: "Color", url: "#color", depth: 2 },
];

export default function BrandPage() {
  return (
    <DocPageRoot>
      <DocContainer>
        {/* Top spacer */}
        <div className="h-12" />

        <div className="screen-line-bottom h-px" />

        {/* Page toolbar */}
        <div className="flex items-center justify-between p-2 pl-4">
          <Button
            className="h-7 gap-2 border-none px-0 text-muted-foreground hover:text-foreground hover:no-underline"
            variant="link"
            size="sm"
            asChild
          >
            <Link href="/">
              <ArrowLeftIcon />
              Home
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <LLMCopyButtonWithViewOptions markdownUrl="/brand.md" />
            <DocShareMenu title={PAGE_TITLE} url="/brand-guidelines" />
          </div>
        </div>

        <div className="screen-line-top screen-line-bottom py-px">
          <div className="h-4" />
        </div>

        <h1
          data-slot="doc-title"
          className="screen-line-bottom px-4 text-3xl font-semibold tracking-tight text-balance"
        >
          {PAGE_TITLE}
        </h1>
      </DocContainer>

      <DocGrid>
        <DocLeftCol />

        <div className="mx-auto w-full md:max-w-4xl">
          {/* Intro */}
          <Panel>
            <PanelDescription className="px-4">
              {PAGE_DESCRIPTION} Right-click any logo on this page to copy it as
              SVG or download the full brand assets pack.
            </PanelDescription>
          </Panel>

          {/* Mark */}
          <Panel>
            <PanelHeader>
              <AnchorHeading id="mark">Mark</AnchorHeading>
            </PanelHeader>

            <BrandContextMenu>
              <PanelContent className="flex items-center justify-center py-16">
                <YTMark className="h-16 w-auto text-foreground sm:h-20" />
              </PanelContent>
            </BrandContextMenu>

            <div className="screen-line-top flex flex-wrap justify-center gap-2 p-4">
              <Button asChild variant="outline" size="sm">
                <a href={MARK_ASSET} download>
                  <Download />
                  Download Mark
                </a>
              </Button>
              <CopyBrandSvgButton type="mark" />
            </div>
          </Panel>

          {/* Logotype */}
          <Panel>
            <PanelHeader>
              <AnchorHeading id="logotype">Logotype</AnchorHeading>
            </PanelHeader>

            <BrandContextMenu>
              <PanelContent className="flex items-center justify-center px-8 py-16">
                <YTWordmark className="h-8 w-auto text-foreground sm:h-10" />
              </PanelContent>
            </BrandContextMenu>

            <div className="screen-line-top flex flex-wrap justify-center gap-2 p-4">
              <Button asChild variant="outline" size="sm">
                <a href={LOGOTYPE_ASSET} download>
                  <Download />
                  Download Logotype
                </a>
              </Button>
              <CopyBrandSvgButton type="logotype" />
            </div>
          </Panel>

          {/* Clear Space */}
          <Panel>
            <PanelHeader>
              <AnchorHeading id="clear-space">Clear Space</AnchorHeading>
            </PanelHeader>

            <PanelDescription className="px-4">
              Maintain a clear space of 1/2 the height of the Mark on all sides
              of the logo, except in limited cases where the logo remains
              clearly recognizable and legible.
            </PanelDescription>

            <PanelContent className="screen-line-top flex flex-col items-center justify-center gap-8 px-4 py-16">
              <YTMarkClearSpace className="h-auto w-1/2 text-foreground sm:w-1/3" />
              <YTWordmarkClearSpace className="h-auto w-full text-foreground" />
            </PanelContent>
          </Panel>

          {/* Color */}
          <Panel>
            <PanelHeader>
              <AnchorHeading id="color">Color</AnchorHeading>
            </PanelHeader>

            <PanelDescription className="px-4">
              The identity is monochrome. Use Ink on light surfaces and Paper on
              dark surfaces to keep the mark legible.
            </PanelDescription>

            <PanelContent className="grid grid-cols-1 gap-px p-0 sm:grid-cols-2">
              <ColorSwatch name="Ink" hex="#09090B" className="bg-[#09090B]" />
              <ColorSwatch name="Paper" hex="#FFFFFF" className="bg-white" />
            </PanelContent>
          </Panel>

          {/* Download all */}
          <Panel>
            <PanelContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-balance text-muted-foreground">
                Download the complete brand assets pack including the mark,
                logotype, and icon in SVG.
              </p>
              <Button asChild>
                <a href={BRAND_ASSETS.url} download>
                  <Download />
                  Download Brand Assets
                </a>
              </Button>
            </PanelContent>
          </Panel>

          {/* Bottom spacer */}
          <div className="h-4 border-x border-line" />
        </div>

        <DocRightCol>
          <div className="sticky top-[calc(var(--doc-cols-top,0)+(--spacing(3)))] translate-x-2 opacity-0 in-data-doc-cols-ready:opacity-100">
            <TOCMinimap items={TOC_ITEMS} />
          </div>
        </DocRightCol>
      </DocGrid>
    </DocPageRoot>
  );
}

function AnchorHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <PanelTitle id={id} className="scroll-mt-20">
      <a
        href={`#${id}`}
        className="group/anchor inline-flex items-center gap-2 no-underline"
      >
        {children}
        <LinkIcon
          className="size-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/panel-title:opacity-100"
          aria-hidden
        />
      </a>
    </PanelTitle>
  );
}

function ColorSwatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-background p-4">
      <div
        className={`size-12 shrink-0 rounded-lg border border-line ${className ?? ""}`}
        aria-hidden
      />
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {hex}
        </span>
      </div>
    </div>
  );
}
