import type { RoastResult } from "@/features/roast/types";

/** Fixed roast used by the design variant previews (/roast/variants). */
export const SAMPLE_ROAST_RESULT: RoastResult = {
  url: "https://yash14.com/",
  domain: "yash14.com",
  score: 89,
  grade: "Actually decent",
  gradeNote: "Annoyingly fine. Still room to sharpen.",
  verdict:
    "Solid work. The remaining issues are the ones that separate good from memorable.",
  dead: null,
  lighthouse: {
    performance: 66,
    accessibility: 96,
    bestPractices: 100,
    seo: 100,
  },
  scannedAt: "2026-10-24T17:32:53.000Z",
  cached: false,
  categories: [
    {
      key: "speed",
      label: "Load speed",
      score: 47,
      line: "Your page takes 4.6 seconds to show up, and the HTML alone weighs 596 KB. That is",
      passedCount: 2,
      issues: [
        {
          id: "html_weight",
          category: "speed",
          label: "HTML size",
          status: "fail",
          value: "596 KB",
          fixes: [
            "Stop inlining large JSON or SVG into the HTML",
            "Paginate or lazy-load long lists",
            "Enable gzip or brotli compression",
          ],
        },
        {
          id: "lcp",
          category: "speed",
          label: "Largest Contentful Paint",
          status: "fail",
          value: "4.6 s",
          fixes: [
            "Preload the hero image and give it fetchpriority=high",
            "Don't lazy-load anything above the fold",
          ],
        },
        {
          id: "tbt",
          category: "speed",
          label: "Total Blocking Time",
          status: "warning",
          value: "410 ms",
          fixes: [
            "Break up long tasks over 50 ms",
            "Hydrate less: keep static sections as server components",
          ],
        },
        {
          id: "performance_score",
          category: "speed",
          label: "Lighthouse performance",
          status: "warning",
          value: "66/100",
          fixes: [
            "Ship less JavaScript: drop unused libraries, split by route",
            "Defer third-party scripts (chat, analytics, ads)",
          ],
        },
        {
          id: "fcp",
          category: "speed",
          label: "First Contentful Paint",
          status: "warning",
          value: "2.1 s",
          fixes: ["Inline critical CSS and defer the rest"],
        },
      ],
    },
    {
      key: "seo",
      label: "SEO",
      score: 100,
      line: 'Perfect 100 for search, so Google finds you every time. Then visitors land on "Full Stack Developer & Design Engineer", a title fifty thousand portfolios share. Google sent them here. Give them a reason to remember you.',
      passedCount: 9,
      issues: [],
    },
    {
      key: "copy",
      label: "Copywriting",
      score: 100,
      line: '485 words, no typos, nothing repeated. Clean copy. But "pixel-perfect" and "attention to detail" are what every developer promises. Show one result you got a client and it beats both phrases put together.',
      passedCount: 4,
      issues: [],
    },
    {
      key: "social",
      label: "Social previews",
      score: 100,
      line: "Share this link anywhere and it shows up dressed properly, title, image and a 140 character description. Pretty wrapping. Now make sure the page behind it loads before the curious click gets bored.",
      passedCount: 5,
      issues: [],
    },
    {
      key: "trust",
      label: "Trust",
      score: 100,
      line: "Secure connection, no broken links, a favicon that shows up. Nothing here scares a visitor off. But safe is the floor, not the finish line. A few client logos or one testimonial would do the actual convincing.",
      passedCount: 5,
      issues: [],
    },
    {
      key: "mobile",
      label: "Mobile & a11y",
      score: 87,
      line: 'Works on a phone and nothing jumps around while it loads. But 4% of 82 images have no description, so screen readers announce them as "image" and move on. Small gap, easy fix, and it opens the site to everyone.',
      passedCount: 5,
      issues: [
        {
          id: "image_alt",
          category: "mobile",
          label: "Image alt text",
          status: "fail",
          value: "4% of 82 images",
          fixes: [
            "Describe every meaningful image in its alt attribute",
            'Use alt="" only for decoration',
          ],
        },
      ],
    },
  ],
};
