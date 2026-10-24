import "server-only";

import type { FetchedPage } from "@/features/roast/lib/safe-fetch";
import type {
  CheckStatus,
  RoastCategoryKey,
  RoastCheck,
} from "@/features/roast/types";

import * as cheerio from "cheerio";
import {
  safeFetch,
  DeadSiteError,
  readTextLimited,
} from "@/features/roast/lib/safe-fetch";

const LINKS_TO_CHECK = 15;

export function check(
  id: string,
  category: RoastCategoryKey,
  label: string,
  status: CheckStatus,
  value: string,
  fixes: string[],
): RoastCheck {
  return { id, category, label, status, value, fixes };
}

function pick(pass: boolean, warning = false): CheckStatus {
  if (pass) return "pass";
  return warning ? "warning" : "fail";
}

/** Static HTML checks, plus robots.txt, sitemap, favicon and a link sample. */
export async function runPageChecks(
  page: FetchedPage,
  signal?: AbortSignal,
): Promise<RoastCheck[]> {
  const $ = cheerio.load(page.html);
  const origin = page.finalUrl.origin;

  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Count = $("h1").length;
  const headingLevels = $("h1, h2, h3, h4, h5, h6")
    .toArray()
    .map((el) => Number(el.tagName.slice(1)));
  const images = $("img").toArray();
  const imagesWithAlt = images.filter(
    (img) => ($(img).attr("alt") ?? "").trim().length > 0,
  ).length;
  const links = $("a[href]")
    .toArray()
    .map((el) => toAbsoluteUrl($(el).attr("href"), page.finalUrl))
    .filter((url): url is URL => url !== null);
  const internalLinks = links.filter((url) => url.origin === origin);
  const canonical = $('link[rel="canonical"]').attr("href");
  const robotsMeta = $('meta[name="robots"]').attr("content") ?? "";
  const viewport = $('meta[name="viewport"]').attr("content") ?? "";
  const charset =
    $("meta[charset]").attr("charset") ??
    page.headers.get("content-type")?.match(/charset=([^;]+)/i)?.[1] ??
    "";
  const lang = $("html").attr("lang") ?? "";
  const meta = (selector: string) => $(selector).attr("content")?.trim() ?? "";
  const ogTitle = meta('meta[property="og:title"]');
  const ogDescription = meta('meta[property="og:description"]');
  const ogImage = meta('meta[property="og:image"]');
  const twitterCard = meta('meta[name="twitter:card"]');
  const twitterTitle = meta('meta[name="twitter:title"]') || ogTitle;
  const twitterDescription =
    meta('meta[name="twitter:description"]') || ogDescription;
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
  const inlineStyleRatio = Math.round(
    ($("[style]").length / Math.max($("*").length, 1)) * 100,
  );
  const wordCount = countWords($);
  const faviconUrl = toAbsoluteUrl(
    $('link[rel~="icon"]').first().attr("href") ?? "/favicon.ico",
    page.finalUrl,
  );

  const [robots, sitemap, faviconOk, brokenLinks] = await Promise.all([
    probe(new URL("/robots.txt", origin), signal),
    probe(new URL("/sitemap.xml", origin), signal),
    faviconUrl ? probe(faviconUrl, signal) : Promise.resolve(false),
    countBrokenLinks(links, signal),
  ]);

  const altRatio = images.length
    ? Math.round((imagesWithAlt / images.length) * 100)
    : 100;
  const kb = Math.round(page.bytes / 1024);
  const twitterTextStatus = pick(
    Boolean(twitterTitle && twitterDescription),
    Boolean(twitterTitle || twitterDescription),
  );

  return [
    // Speed, from the raw HTML request. PageSpeed adds the lab metrics.
    check(
      "response_time",
      "speed",
      "Server response",
      pick(page.responseTimeMs <= 800, page.responseTimeMs <= 1800),
      `${page.responseTimeMs} ms`,
      [
        "Cache HTML at the edge or use static generation",
        "Move the server closer to visitors or put a CDN in front",
        "Profile slow database calls on the homepage",
      ],
    ),
    check(
      "html_weight",
      "speed",
      "HTML size",
      pick(kb <= 100, kb <= 300),
      `${kb} KB`,
      [
        "Stop inlining large JSON or SVG into the HTML",
        "Paginate or lazy-load long lists",
        "Enable gzip or brotli compression",
      ],
    ),

    // SEO
    check(
      "title_tag",
      "seo",
      "Title tag",
      pick(
        title.length >= 30 && title.length <= 60,
        title.length >= 10 && title.length <= 70,
      ),
      title ? `"${truncate(title)}" (${title.length} chars)` : "Missing",
      [
        "Write one title of 30 to 60 characters",
        "Lead with what the page is about, then the brand",
      ],
    ),
    check(
      "heading_hierarchy",
      "seo",
      "Heading order",
      isLogicalHeadingOrder(headingLevels) ? "pass" : "warning",
      headingLevels.length
        ? `H${headingLevels.slice(0, 12).join(" > H")}`
        : "No headings",
      [
        "Go H1 > H2 > H3 without skipping levels",
        "Never style text as a fake heading",
      ],
    ),
    check(
      "canonical",
      "seo",
      "Canonical tag",
      canonical ? "pass" : "fail",
      canonical ?? "Missing",
      ['Add <link rel="canonical" href="..."> with the final URL'],
    ),
    check(
      "noindex",
      "seo",
      "Indexable",
      /noindex/i.test(robotsMeta) ? "fail" : "pass",
      robotsMeta || "No robots meta",
      ["Remove noindex unless the page should stay out of Google"],
    ),
    check(
      "robots_txt",
      "seo",
      "robots.txt",
      robots ? "pass" : "fail",
      robots ? "Found" : "Missing",
      ["Serve /robots.txt and point it at your sitemap"],
    ),
    check(
      "sitemap_xml",
      "seo",
      "sitemap.xml",
      sitemap ? "pass" : "warning",
      sitemap ? "Found" : "Missing",
      ["Generate /sitemap.xml", "Submit it in Google Search Console"],
    ),
    check(
      "structured_data",
      "seo",
      "Structured data",
      hasJsonLd ? "pass" : "warning",
      hasJsonLd ? "JSON-LD found" : "None",
      ["Add schema.org JSON-LD (Organization, WebSite, Product...)"],
    ),
    check(
      "duplicate_meta",
      "seo",
      "Duplicate meta tags",
      $("title").length > 1 || $('meta[name="description"]').length > 1
        ? "fail"
        : "pass",
      `${$("title").length} title, ${$('meta[name="description"]').length} description`,
      ["Keep exactly one title and one meta description"],
    ),

    // Copy
    check(
      "h1",
      "copy",
      "H1 heading",
      h1Count === 1 ? "pass" : h1Count > 1 ? "warning" : "fail",
      h1Count === 1
        ? `"${truncate($("h1").first().text().replace(/\s+/g, " ").trim())}"`
        : `${h1Count} H1 tags`,
      ["Use exactly one H1 that says what you do and for whom"],
    ),
    check(
      "meta_description",
      "copy",
      "Meta description",
      pick(
        description.length >= 120 && description.length <= 160,
        description.length >= 50 && description.length <= 200,
      ),
      description ? `${description.length} chars` : "Missing",
      [
        "Write 120 to 160 characters that sell the click",
        "Name the benefit, not the company history",
      ],
    ),
    check(
      "word_count",
      "copy",
      "Words on the page",
      pick(wordCount >= 300, wordCount >= 150),
      `${wordCount} words`,
      [
        "Explain the offer, who it is for and why it is better",
        "Add proof: numbers, testimonials, case studies",
        "If the copy only renders with JavaScript, server-render it",
      ],
    ),
    check(
      "internal_links",
      "copy",
      "Internal links",
      pick(internalLinks.length >= 5, internalLinks.length >= 1),
      `${internalLinks.length} links`,
      ["Link to your key pages from the homepage with descriptive anchors"],
    ),

    // Social
    check(
      "og_title",
      "social",
      "og:title",
      ogTitle ? "pass" : "fail",
      ogTitle ? truncate(ogTitle) : "Missing",
      ['Add <meta property="og:title">'],
    ),
    check(
      "og_description",
      "social",
      "og:description",
      ogDescription ? "pass" : "warning",
      ogDescription ? `${ogDescription.length} chars` : "Missing",
      ['Add <meta property="og:description">'],
    ),
    check(
      "og_image",
      "social",
      "og:image",
      ogImage ? "pass" : "fail",
      ogImage ? "Present" : "Missing",
      ["Add a 1200x630 og:image so shared links are not blank grey boxes"],
    ),
    check(
      "twitter_card",
      "social",
      "twitter:card",
      twitterCard ? "pass" : "warning",
      twitterCard || "Missing",
      ['Add <meta name="twitter:card" content="summary_large_image">'],
    ),
    check(
      "twitter_text",
      "social",
      "X title and description",
      twitterTextStatus,
      twitterTextStatus === "pass" ? "Present" : "Incomplete",
      ["Add twitter:title and twitter:description, or og: equivalents"],
    ),

    // Trust
    check(
      "https",
      "trust",
      "HTTPS",
      page.finalUrl.protocol === "https:" ? "pass" : "fail",
      page.finalUrl.protocol === "https:" ? "Enabled" : "HTTP only",
      ["Install a TLS certificate", "Redirect all HTTP traffic to HTTPS"],
    ),
    check(
      "favicon",
      "trust",
      "Favicon",
      faviconOk ? "pass" : "warning",
      faviconOk ? "Found" : "Missing or broken",
      ['Add a square icon and link it with <link rel="icon">'],
    ),
    check(
      "broken_links",
      "trust",
      "Broken links",
      brokenLinks.broken === 0
        ? "pass"
        : brokenLinks.broken <= 2
          ? "warning"
          : "fail",
      `${brokenLinks.broken} of ${brokenLinks.checked} sampled`,
      ["Fix or remove links that return 404", "Redirect moved pages"],
    ),
    check(
      "charset",
      "trust",
      "Charset",
      charset ? "pass" : "warning",
      charset || "Not declared",
      ['Add <meta charset="utf-8"> as the first tag in <head>'],
    ),

    // Mobile and accessibility
    check(
      "viewport",
      "mobile",
      "Viewport tag",
      viewport ? "pass" : "fail",
      viewport ? "Present" : "Missing",
      [
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      ],
    ),
    check(
      "html_lang",
      "mobile",
      "Language attribute",
      lang ? "pass" : "warning",
      lang || "Missing",
      ['Set <html lang="en"> (or your language) for screen readers'],
    ),
    check(
      "image_alt",
      "mobile",
      "Image alt text",
      pick(altRatio >= 90, altRatio >= 60),
      `${altRatio}% of ${images.length} images`,
      [
        "Describe every meaningful image in its alt attribute",
        'Use alt="" only for decoration',
      ],
    ),
    check(
      "inline_styles",
      "mobile",
      "Inline styles",
      pick(inlineStyleRatio <= 10, inlineStyleRatio <= 25),
      `${inlineStyleRatio}% of elements`,
      ["Move inline styles into CSS so layouts can adapt per breakpoint"],
    ),
  ];
}

function toAbsoluteUrl(href: string | undefined, base: URL) {
  if (!href) return null;
  try {
    const url = new URL(href, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function countWords($: cheerio.CheerioAPI) {
  const body = $("body").clone();
  body.find("script, style, noscript, svg, template").remove();
  const text = body.text().replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

function isLogicalHeadingOrder(levels: number[]) {
  return levels.every((level, i) => i === 0 || level - levels[i - 1] <= 1);
}

function truncate(text: string, max = 60) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** True when the URL answers 2xx. Never throws. */
async function probe(url: URL, signal?: AbortSignal) {
  try {
    const { response } = await safeFetch(url, { timeoutMs: 5000, signal });
    await readTextLimited(response, 64 * 1024);
    return response.ok;
  } catch {
    return false;
  }
}

async function countBrokenLinks(links: URL[], signal?: AbortSignal) {
  const unique = [...new Set(links.map((url) => url.href.split("#")[0]))]
    .slice(0, LINKS_TO_CHECK)
    .map((href) => new URL(href));

  const results = await Promise.all(
    unique.map(async (url) => {
      try {
        const { response } = await safeFetch(url, {
          method: "HEAD",
          timeoutMs: 5000,
          signal,
        });
        // 401, 403, 405 and 429 usually mean bot protection, not a dead page.
        return (
          response.status === 404 ||
          response.status === 410 ||
          response.status >= 500
        );
      } catch (error) {
        // A timeout proves nothing, but a domain that no longer exists does.
        return (
          error instanceof DeadSiteError && error.reason === "dns_not_found"
        );
      }
    }),
  );

  return { broken: results.filter(Boolean).length, checked: unique.length };
}
