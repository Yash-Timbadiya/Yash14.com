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
      line: "Even turtles use your site as a benchmark for taking things slow.",
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
      line: "Google loves you. Now give the humans it sends a reason to stay.",
      passedCount: 9,
      issues: [],
    },
    {
      key: "copy",
      label: "Copywriting",
      score: 100,
      line: "Clear words, perfect score. Clear isn't the same as convincing, though.",
      passedCount: 4,
      issues: [],
    },
    {
      key: "social",
      label: "Social previews",
      score: 100,
      line: "Perfect previews. Pretty wrapping only works if the gift inside is worth opening.",
      passedCount: 5,
      issues: [],
    },
    {
      key: "trust",
      label: "Trust",
      score: 100,
      line: "Nothing broken, nothing scary. Safe is the floor, not the finish line.",
      passedCount: 5,
      issues: [],
    },
    {
      key: "mobile",
      label: "Mobile & a11y",
      score: 87,
      line: "Almost phone-friendly. Thumbs still find every rough edge you missed.",
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
