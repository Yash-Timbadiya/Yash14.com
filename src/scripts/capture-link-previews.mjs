// Captures the fallback screenshots LinkPreview shows when Microlink is slow
// or rate-limited, into cdn/link-previews/. Publish them with `pnpm cdn:upload`.
//
// It crawls the site for every link that has a hover preview (expanding the
// collapsed experience and education entries), so new links are picked up
// without keeping a list here.
//
// Usage (one-time setup: `pnpm exec playwright install chromium`):
//   pnpm cdn:previews                 crawl http://localhost:3000, capture new links
//   pnpm cdn:previews --all           also recapture links that already have one
//   pnpm cdn:previews --base <url>    crawl another origin, e.g. https://yash14.com
import sharp from "sharp";
import { join } from "node:path";
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import {
  getLinkPreviewSlug,
  LINK_PREVIEW_DIR,
} from "../utils/link-preview-slug.mjs";

const OUT_DIR = join("cdn", LINK_PREVIEW_DIR);

// Same viewport and color scheme as the live Microlink screenshots.
const VIEWPORT = { width: 1280, height: 720 };
// 3x the 192x108 card, so it stays sharp on high-density screens.
const OUTPUT_SIZE = { width: 576, height: 324 };
const PAGE_TIMEOUT_MS = 30_000;
// Lets fonts, hero animations and lazy images settle before the capture.
const SETTLE_MS = 2000;

const args = process.argv.slice(2);
const recaptureAll = args.includes("--all");
const baseIndex = args.indexOf("--base");
const base = new URL(
  baseIndex === -1 ? "http://localhost:3000" : args[baseIndex + 1],
);

async function getSitePages() {
  try {
    const res = await fetch(new URL("/sitemap.xml", base));
    const xml = await res.text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, loc]) => new URL(loc).pathname,
    );
    return paths.length > 0 ? [...new Set(paths)] : ["/"];
  } catch {
    return ["/"];
  }
}

async function expandCollapsibles(page) {
  const closed = page.locator(
    '[data-slot="collapsible-trigger"][aria-expanded="false"]:not([data-disabled])',
  );
  for (const trigger of await closed.all()) {
    await trigger.click().catch(() => {});
  }
  await page.waitForTimeout(500);
}

async function isBlank(png) {
  const { channels } = await sharp(png).stats();
  return channels.every((channel) => channel.stdev < 1);
}

async function collectPreviewUrls(page) {
  const hrefs = await page
    .locator("a[data-link-preview]")
    .evaluateAll((links) => links.map((link) => link.href));
  return hrefs.filter((href) => new URL(href).origin !== base.origin);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  colorScheme: "dark",
  // Some sites, like x.com, render a blank page for a "HeadlessChrome" agent.
  userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`,
});
const page = await context.newPage();

const urlsBySlug = new Map();
for (const path of await getSitePages()) {
  const pageUrl = new URL(path, base).href;
  try {
    await page.goto(pageUrl, { waitUntil: "load", timeout: PAGE_TIMEOUT_MS });
    await expandCollapsibles(page);
    for (const url of await collectPreviewUrls(page)) {
      const slug = getLinkPreviewSlug(url);
      if (slug && !urlsBySlug.has(slug)) urlsBySlug.set(slug, url);
    }
  } catch (error) {
    console.warn(`Could not crawl ${pageUrl}: ${error.message}`);
  }
}

if (urlsBySlug.size === 0) {
  console.error(
    `No preview links found on ${base.origin}. Is the site running?`,
  );
  await browser.close();
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

let captured = 0;
let skipped = 0;
const failed = [];

for (const [slug, url] of urlsBySlug) {
  const file = join(OUT_DIR, `${slug}.webp`);
  if (!recaptureAll && existsSync(file)) {
    skipped++;
    continue;
  }

  try {
    await page.goto(url, { waitUntil: "load", timeout: PAGE_TIMEOUT_MS });
    await page.waitForTimeout(SETTLE_MS);
    const png = await page.screenshot();
    // A single-color capture means the site refused to render; the component
    // shows the hostname when there is no file, which beats a blank card.
    if (await isBlank(png)) throw new Error("page rendered blank");
    await sharp(png).resize(OUTPUT_SIZE).webp({ quality: 75 }).toFile(file);
    captured++;
    console.log(`Captured ${slug}`);
  } catch (error) {
    failed.push(url);
    console.warn(`Failed ${url}: ${error.message}`);
  }
}

await browser.close();

console.log(
  `\n${captured} captured, ${skipped} already present, ${failed.length} failed.`,
);
if (captured > 0) {
  console.log("Run `pnpm cdn:upload` to publish them.");
}
