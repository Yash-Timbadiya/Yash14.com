export type CheckStatus = "pass" | "warning" | "fail";

export type RoastCategoryKey =
  | "speed"
  | "seo"
  | "copy"
  | "social"
  | "trust"
  | "mobile";

export type RoastCheck = {
  id: string;
  category: RoastCategoryKey;
  label: string;
  status: CheckStatus;
  /** What was measured, shown next to the label ("2.4 s", "Missing"). */
  value: string;
  /** Short, concrete steps. Only shown after the visitor asks for fixes. */
  fixes: string[];
};

export type RoastCategory = {
  key: RoastCategoryKey;
  label: string;
  score: number;
  line: string;
  /** Failing and warning checks, worst first. */
  issues: RoastCheck[];
  passedCount: number;
};

export type DeadSiteReason =
  | "not_a_domain"
  | "dns_not_found"
  | "timeout"
  | "unreachable"
  | "http_error";

export type RoastResult = {
  url: string;
  domain: string;
  score: number;
  grade: string;
  gradeNote: string;
  verdict: string;
  categories: RoastCategory[];
  /** Set when the site could not be loaded at all. */
  dead: { reason: DeadSiteReason; detail: string; fixes: string[] } | null;
  /** Lighthouse lab scores, null when PageSpeed was unavailable. */
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  } | null;
  scannedAt: string;
  cached: boolean;
};

export type RoastStreamEvent =
  | { type: "log"; message: string }
  | { type: "result"; result: RoastResult }
  | { type: "error"; message: string };
