import "server-only";

import type { RoastCheck, RoastResult } from "@/features/roast/types";

import { config } from "@/config";
import { check } from "@/features/roast/lib/page-checks";

const PAGESPEED_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PAGESPEED_TIMEOUT_MS = 45_000;

type LighthouseAudit = { numericValue?: number };
type PageSpeedResponse = {
  lighthouseResult?: {
    audits?: Record<string, LighthouseAudit | undefined>;
    categories?: Record<string, { score?: number | null } | undefined>;
  };
};

export type PageSpeedOutcome = {
  checks: RoastCheck[];
  lighthouse: NonNullable<RoastResult["lighthouse"]>;
};

/** Mobile Lighthouse run. Returns null when Google can't test the page. */
export async function runPageSpeed(
  url: URL,
  signal?: AbortSignal,
): Promise<PageSpeedOutcome | null> {
  const params = new URLSearchParams({ url: url.href, strategy: "mobile" });
  for (const category of [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ]) {
    params.append("category", category);
  }
  if (config.roast.pagespeedApiKey) {
    params.set("key", config.roast.pagespeedApiKey);
  }

  const timeout = AbortSignal.timeout(PAGESPEED_TIMEOUT_MS);
  let data: PageSpeedResponse;
  try {
    const response = await fetch(`${PAGESPEED_ENDPOINT}?${params}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(`[roast] PageSpeed returned HTTP ${response.status}`);
      return null;
    }
    data = (await response.json()) as PageSpeedResponse;
  } catch (error) {
    console.warn("[roast] PageSpeed failed", error);
    return null;
  }

  const audits = data.lighthouseResult?.audits ?? {};
  const categories = data.lighthouseResult?.categories ?? {};
  const score = (key: string) =>
    Math.round((categories[key]?.score ?? 0) * 100);
  const metric = (key: string) => audits[key]?.numericValue;

  const lighthouse = {
    performance: score("performance"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    seo: score("seo"),
  };

  const checks: RoastCheck[] = [
    scoreCheck(
      "performance_score",
      "speed",
      "Lighthouse performance",
      lighthouse.performance,
      [
        "Ship less JavaScript: drop unused libraries, split by route",
        "Serve images as AVIF or WebP at the size they are shown",
        "Defer third-party scripts (chat, analytics, ads)",
      ],
    ),
    scoreCheck(
      "accessibility_score",
      "mobile",
      "Lighthouse accessibility",
      lighthouse.accessibility,
      [
        "Fix low-contrast text",
        "Give every button and link an accessible name",
        "Make tap targets at least 24 x 24 px",
      ],
    ),
    scoreCheck(
      "best_practices_score",
      "trust",
      "Lighthouse best practices",
      lighthouse.bestPractices,
      [
        "Clear console errors",
        "Remove deprecated APIs and vulnerable libraries",
      ],
    ),
    scoreCheck("lighthouse_seo", "seo", "Lighthouse SEO", lighthouse.seo, [
      "Open the Lighthouse SEO section and fix each failed audit",
    ]),
  ];

  const lcp = metric("largest-contentful-paint");
  if (lcp !== undefined) {
    checks.push(
      check(
        "lcp",
        "speed",
        "Largest Contentful Paint",
        threshold(lcp, 2500, 4000),
        seconds(lcp),
        [
          "Preload the hero image and give it fetchpriority=high",
          "Don't lazy-load anything above the fold",
          "Render the hero on the server, not after hydration",
        ],
      ),
    );
  }

  const fcp = metric("first-contentful-paint");
  if (fcp !== undefined) {
    checks.push(
      check(
        "fcp",
        "speed",
        "First Contentful Paint",
        threshold(fcp, 1800, 3000),
        seconds(fcp),
        [
          "Inline critical CSS and defer the rest",
          "Self-host fonts with font-display: swap",
        ],
      ),
    );
  }

  const tbt = metric("total-blocking-time");
  if (tbt !== undefined) {
    checks.push(
      check(
        "tbt",
        "speed",
        "Total Blocking Time",
        threshold(tbt, 200, 600),
        `${Math.round(tbt)} ms`,
        [
          "Break up long tasks over 50 ms",
          "Hydrate less: keep static sections as server components",
        ],
      ),
    );
  }

  const cls = metric("cumulative-layout-shift");
  if (cls !== undefined) {
    checks.push(
      check(
        "cls",
        "mobile",
        "Layout shift (CLS)",
        threshold(cls, 0.1, 0.25),
        cls.toFixed(2),
        [
          "Set width and height on every image and embed",
          "Reserve space for banners and ads before they load",
        ],
      ),
    );
  }

  return { checks, lighthouse };
}

function scoreCheck(
  id: string,
  category: RoastCheck["category"],
  label: string,
  value: number,
  fixes: string[],
) {
  const status = value >= 90 ? "pass" : value >= 50 ? "warning" : "fail";
  return check(id, category, label, status, `${value}/100`, fixes);
}

function threshold(value: number, good: number, poor: number) {
  if (value <= good) return "pass";
  return value <= poor ? "warning" : "fail";
}

function seconds(ms: number) {
  return `${(ms / 1000).toFixed(1)} s`;
}
