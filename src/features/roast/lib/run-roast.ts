import "server-only";

import type { RoastResult } from "@/features/roast/types";

import { runPageSpeed } from "@/features/roast/lib/pagespeed";
import { SCAN_QUIPS } from "@/features/roast/data/roast-content";
import { runPageChecks } from "@/features/roast/lib/page-checks";
import { extractPageCopy } from "@/features/roast/lib/page-copy";
import { applyAiRoast, generateAiRoast } from "@/features/roast/lib/ai-roast";
import { buildRoast, buildDeadRoast } from "@/features/roast/lib/build-roast";
import {
  fetchPage,
  DeadSiteError,
  assertPublicHost,
} from "@/features/roast/lib/safe-fetch";

/** Stable cache key: no hash, no trailing slash, sorted query. */
export function normalizeRoastUrl(url: URL) {
  const copy = new URL(url);
  copy.hash = "";
  copy.searchParams.sort();
  if (copy.pathname.length > 1) {
    copy.pathname = copy.pathname.replace(/\/+$/, "");
  }
  return copy.href;
}

export function displayDomain(url: URL) {
  return url.hostname.replace(/^www\./, "");
}

/**
 * Cache key that ignores the protocol, a leading www and a trailing slash,
 * so https://www.example.com/ and example.com share one cached roast.
 */
export function roastCacheKey(url: URL) {
  const query = new URLSearchParams(url.searchParams);
  query.sort();
  const search = query.size > 0 ? `?${query}` : "";
  return `${displayDomain(url)}${url.pathname.replace(/\/+$/, "")}${search}`;
}

/**
 * Fetches the page, runs the HTML checks and Lighthouse in parallel, and
 * turns the results into a roast, written by AI when a provider answers. `log` receives terminal lines as it goes.
 */
export async function runRoast(
  url: URL,
  log: (message: string) => void,
  signal: AbortSignal,
): Promise<RoastResult> {
  const href = normalizeRoastUrl(url);
  const domain = displayDomain(url);
  const fill = (line: string, values: Record<string, string | number>) =>
    line.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

  // Lighthouse is the slow part (10 to 40 s), so it starts first and runs
  // while the HTML is fetched and checked.
  const pageSpeedAbort = new AbortController();
  const stopPageSpeed = () => pageSpeedAbort.abort();
  signal.addEventListener("abort", stopPageSpeed, { once: true });

  try {
    log(fill(SCAN_QUIPS.start, { domain }));
    await assertPublicHost(url);
    log(SCAN_QUIPS.resolved);

    const pageSpeedPromise = runPageSpeed(url, pageSpeedAbort.signal);

    log(SCAN_QUIPS.fetching);
    const page = await fetchPage(url, signal);
    const kb = Math.round(page.bytes / 1024);
    log(
      fill(SCAN_QUIPS.fetched, {
        kb,
        ms: page.responseTimeMs,
        mood:
          page.responseTimeMs > 1800 ? "took its sweet time" : "not bad, sadly",
      }),
    );

    log(SCAN_QUIPS.checks);
    const checks = await runPageChecks(page, signal);

    log(SCAN_QUIPS.pagespeed);
    const pageSpeed = await pageSpeedPromise;
    log(pageSpeed ? SCAN_QUIPS.pagespeedDone : SCAN_QUIPS.pagespeedSkipped);

    const allChecks = [...checks, ...(pageSpeed?.checks ?? [])];
    const roast = buildRoast({
      url: href,
      domain,
      checks: allChecks,
      lighthouse: pageSpeed?.lighthouse ?? null,
    });

    log(SCAN_QUIPS.aiRoasting);
    const aiRoast = await generateAiRoast(
      { roast, checks: allChecks, copy: extractPageCopy(page.html) },
      signal,
    );
    log(aiRoast ? SCAN_QUIPS.aiDone : SCAN_QUIPS.aiSkipped);

    log(SCAN_QUIPS.compiling);
    return aiRoast ? applyAiRoast(roast, aiRoast) : roast;
  } catch (error) {
    if (!(error instanceof DeadSiteError)) throw error;

    stopPageSpeed();
    log(`> ${error.message.replace(/\.$/, "")} ... oh no`);
    log(SCAN_QUIPS.compiling);
    return buildDeadRoast({
      url: href,
      domain,
      reason: error.reason,
      detail: error.message,
    });
  } finally {
    signal.removeEventListener("abort", stopPageSpeed);
  }
}
