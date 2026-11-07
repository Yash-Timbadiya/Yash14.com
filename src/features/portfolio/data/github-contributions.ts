import "server-only";

import type { Activity } from "@/features/portfolio/types/contributions";

import { config } from "@/config";
import { unstable_cache } from "next/cache";
import { GITHUB_USERNAME } from "@/config/site";

type GitHubContributionsResponse = {
  contributions: Activity[];
};

const CONTRIBUTIONS_FETCH_TIMEOUT_MS = 10_000;

const getCachedGitHubContributions = unstable_cache(
  async () => {
    const res = await fetch(
      `${config.github.contributionsApiUrl}/v4/${GITHUB_USERNAME}?y=last`,
      { signal: AbortSignal.timeout(CONTRIBUTIONS_FETCH_TIMEOUT_MS) },
    );
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as GitHubContributionsResponse;
    return data.contributions ?? [];
  },
  ["github-contributions"],
  { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
);

export async function getGitHubContributions(): Promise<Activity[]> {
  try {
    return await getCachedGitHubContributions();
  } catch (error) {
    // The contributions API is optional. A timeout during static generation
    // must not fail the Vercel build; the graph renders nothing until retry.
    console.error("GitHub contributions unavailable.", error);
    return [];
  }
}
