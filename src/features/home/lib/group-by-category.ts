import type { TechStack } from "@/features/portfolio/types/tech-stack";

/** Tools bucketed by category, in first-seen order; a tool in two categories appears in both. */
export function groupByCategory(
  items: TechStack[],
): Record<string, TechStack[]> {
  const grouped: Record<string, TechStack[]> = {};

  for (const item of items) {
    for (const category of item.categories) {
      const bucket = grouped[category];
      if (bucket) {
        bucket.push(item);
      } else {
        grouped[category] = [item];
      }
    }
  }

  return grouped;
}
