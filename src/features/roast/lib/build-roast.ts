import type {
  CheckStatus,
  DeadSiteReason,
  RoastCategory,
  RoastCheck,
  RoastResult,
} from "@/features/roast/types";

import {
  roastTierFor,
  ROAST_GRADES,
  CATEGORY_ROASTS,
  ROAST_VERDICTS,
  DEAD_SITE_ROASTS,
  ROAST_CATEGORIES,
  CLEAN_CATEGORY_ROASTS,
} from "@/features/roast/data/roast-content";

// Same weights as metamax: a warning still earns most of the credit.
const STATUS_POINTS: Record<CheckStatus, number> = {
  pass: 100,
  warning: 60,
  fail: 20,
};
const STATUS_ORDER: Record<CheckStatus, number> = {
  fail: 0,
  warning: 1,
  pass: 2,
};

/** FNV-1a. Seeds line picks so the same site always gets the same jokes. */
function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickFrom<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function gradeFor(score: number) {
  let index = 0;
  ROAST_GRADES.forEach((grade, i) => {
    if (score >= grade.min) index = i;
  });
  return { ...ROAST_GRADES[index], index };
}

export function buildRoast({
  url,
  domain,
  checks,
  lighthouse,
}: {
  url: string;
  domain: string;
  checks: RoastCheck[];
  lighthouse: RoastResult["lighthouse"];
}): RoastResult {
  const random = createSeededRandom(hashString(domain));

  const categories = ROAST_CATEGORIES.map<RoastCategory>(({ key, label }) => {
    const inCategory = checks.filter((c) => c.category === key);
    const issues = inCategory
      .filter((c) => c.status !== "pass")
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    const score = inCategory.length
      ? Math.round(
          inCategory.reduce((sum, c) => sum + STATUS_POINTS[c.status], 0) /
            inCategory.length,
        )
      : 0;

    const line =
      issues.length > 0
        ? pickFrom(CATEGORY_ROASTS[key][roastTierFor(score)], random)
        : pickFrom(CLEAN_CATEGORY_ROASTS[key], random);

    return {
      key,
      label,
      score,
      line,
      issues,
      passedCount: inCategory.length - issues.length,
    };
  });

  const score = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );
  const grade = gradeFor(score);

  return {
    url,
    domain,
    score,
    grade: grade.label,
    gradeNote: grade.note,
    verdict: pickFrom(ROAST_VERDICTS[grade.index], random),
    categories,
    dead: null,
    lighthouse,
    scannedAt: new Date().toISOString(),
    cached: false,
  };
}

export function buildDeadRoast({
  url,
  domain,
  reason,
  detail,
}: {
  url: string;
  domain: string;
  reason: DeadSiteReason;
  detail: string;
}): RoastResult {
  const roast = DEAD_SITE_ROASTS[reason];

  return {
    url,
    domain,
    score: 0,
    grade: roast.headline,
    gradeNote: detail,
    verdict: roast.verdict,
    categories: ROAST_CATEGORIES.map(({ key, label }, i) => ({
      key,
      label,
      score: 0,
      line: roast.lines[i],
      issues: [],
      passedCount: 0,
    })),
    dead: { reason, detail, fixes: roast.fixes },
    lighthouse: null,
    scannedAt: new Date().toISOString(),
    cached: false,
  };
}
