import type { MetadataRoute } from "next";

import path from "node:path";
import { SITE_INFO } from "@/config/site";
import { readdirSync, statSync } from "node:fs";

export const revalidate = false;
export const dynamic = "force-static";

const APP_DIR = path.join(process.cwd(), "src", "app");
const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx)$/;

// Dev-only pages that 404 in production, and /cv, which redirects to its
// own subdomain.
const EXCLUDED_ROUTES = new Set(["/og", "/cv"]);

// Dynamic ([slug]), parallel (@slot) and private (_folder) segments have no
// single static URL, so a page under any of them is left out.
const isExcludedSegment = (segment: string) =>
  /^\[.*\]$/.test(segment) ||
  segment.startsWith("@") ||
  segment.startsWith("_");

// Route groups like (home) never appear in the URL.
const isRouteGroup = (segment: string) => /^\(.*\)$/.test(segment);

function collectRoutes(dir: string, segments: string[] = []) {
  const routes: { pathname: string; lastModified: Date }[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (isExcludedSegment(entry.name)) continue;
      const next = isRouteGroup(entry.name)
        ? segments
        : [...segments, entry.name];
      routes.push(...collectRoutes(path.join(dir, entry.name), next));
    } else if (PAGE_FILE.test(entry.name)) {
      routes.push({
        pathname: `/${segments.join("/")}`,
        lastModified: statSync(path.join(dir, entry.name)).mtime,
      });
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return collectRoutes(APP_DIR)
    .filter(({ pathname }) => !EXCLUDED_ROUTES.has(pathname))
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .map(({ pathname, lastModified }) => ({
      url: pathname === "/" ? SITE_INFO.url : `${SITE_INFO.url}${pathname}`,
      lastModified,
    }));
}
