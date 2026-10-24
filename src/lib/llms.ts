import { format } from "date-fns";
import { BOOKMARKS } from "@/features/bookmark/data";
import { USER } from "@/features/portfolio/data/user";
import { BRAND_ASSETS, SITE_INFO } from "@/config/site";
import { BookmarkCategory } from "@/features/bookmark/types";
import { EDUCATION } from "@/features/portfolio/data/education";
import { TECH_STACK } from "@/features/portfolio/data/tech-stack";
import { EXPERIENCES } from "@/features/portfolio/data/experiences";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";

// Shared by the per-section .md routes and llms-full.txt, which nests the
// same content one heading level deeper.

function heading(level: number, text: string) {
  return `${"#".repeat(level)} ${text}`;
}

function formatPeriod({ start, end }: { start: string; end?: string }) {
  return `${start} – ${end ?? "Present"}`;
}

export function getExperienceMarkdown(level = 2) {
  return EXPERIENCES.map((company) => {
    const where = [company.location, company.locationType]
      .filter(Boolean)
      .join(" · ");

    const companyMeta = [
      company.companyWebsite && `- Website: ${company.companyWebsite}`,
      where && `- Location: ${where}`,
    ]
      .filter(Boolean)
      .join("\n");

    const positions = company.positions
      .map((position) => {
        const meta = [
          `- Period: ${formatPeriod(position.employmentPeriod)}`,
          position.employmentType &&
            `- Employment type: ${position.employmentType}`,
          position.skills?.length && `- Skills: ${position.skills.join(", ")}`,
        ]
          .filter(Boolean)
          .join("\n");

        return [
          heading(level + 1, position.title),
          meta,
          position.description?.trim(),
        ]
          .filter(Boolean)
          .join("\n\n");
      })
      .join("\n\n");

    return [heading(level, company.companyName), companyMeta, positions]
      .filter(Boolean)
      .join("\n\n");
  }).join("\n\n");
}

export function getEducationMarkdown(level = 2) {
  return EDUCATION.map((item) => {
    const meta = [
      item.degree && `- Degree: ${item.degree}`,
      item.fieldOfStudy && `- Field of study: ${item.fieldOfStudy}`,
      `- Period: ${formatPeriod(item.period)}`,
      item.skills?.length && `- Skills: ${item.skills.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    return [heading(level, item.school), meta, item.description?.trim()]
      .filter(Boolean)
      .join("\n\n");
  }).join("\n\n");
}

/** One line per role, for llms.txt; the details live in experience.md. */
export function getExperienceSummary() {
  return EXPERIENCES.flatMap((company) => {
    const companyName = company.companyWebsite
      ? `[${company.companyName}](${company.companyWebsite})`
      : company.companyName;

    return company.positions.map((position) => {
      const meta = [
        formatPeriod(position.employmentPeriod),
        position.employmentType,
        company.locationType,
      ]
        .filter(Boolean)
        .join(" · ");

      return `- ${position.title} at ${companyName} (${meta})`;
    });
  }).join("\n");
}

/** One line per school, for llms.txt; the details live in education.md. */
export function getEducationSummary() {
  return EDUCATION.map((item) => {
    const study = [item.degree, item.fieldOfStudy].filter(Boolean).join(", ");

    return `- ${study ? `${study} — ` : ""}${item.school} (${formatPeriod(item.period)})`;
  }).join("\n");
}

export function getBookmarksMarkdown(level = 2) {
  return Object.values(BookmarkCategory)
    .map((category) => ({
      category,
      items: sortBookmarksNewestFirst(
        BOOKMARKS.filter((item) => item.category === category),
      ),
    }))
    .filter(({ items }) => items.length > 0)
    .map(
      ({ category, items }) =>
        `${heading(level, `${category} (${items.length})`)}

${items
  .map(
    (item) =>
      `- [${item.title}](${item.url})${item.author ? ` by ${item.author}` : ""} (${format(new Date(item.bookmarkedAt), "yyyy-MM-dd")})${item.why ? `\n  ${item.why}` : ""}`,
  )
  .join("\n")}`,
    )
    .join("\n\n");
}

// Insertion order matches the Stack section, which groups the same way.
function groupTechStackByCategory() {
  const grouped = new Map<string, typeof TECH_STACK>();

  for (const item of TECH_STACK) {
    for (const category of item.categories) {
      grouped.set(category, [...(grouped.get(category) ?? []), item]);
    }
  }

  return [...grouped];
}

export function getTechStackMarkdown(level = 2) {
  return groupTechStackByCategory()
    .map(
      ([category, items]) =>
        `${heading(level, category)}

${items.map((item) => `- [${item.title}](${item.href})`).join("\n")}`,
    )
    .join("\n\n");
}

/** One line per category, for llms.txt; the links live in about.md. */
export function getTechStackSummary() {
  return groupTechStackByCategory()
    .map(
      ([category, items]) =>
        `- ${category}: ${items.map((item) => item.title).join(", ")}`,
    )
    .join("\n");
}

// Mirrors the copy on /brand-guidelines; keep the two in sync.
export function getBrandMarkdown(level = 2) {
  return `> Key elements of the ${USER.displayName} visual identity, including the mark, logotype, clear space, and color.

${heading(level, "Mark")}

- SVG: ${SITE_INFO.url}/assets/yash14-brand/yash14-mark.svg

${heading(level, "Logotype")}

- SVG: ${SITE_INFO.url}/assets/yash14-brand/yash14-logotype.svg

${heading(level, "Clear Space")}

Maintain a clear space of 1/2 the height of the Mark on all sides of the logo, except in limited cases where the logo remains clearly recognizable and legible.

${heading(level, "Color")}

The identity is monochrome. Use Ink on light surfaces and Paper on dark surfaces to keep the mark legible.

- Ink: #09090B
- Paper: #FFFFFF

${heading(level, "Downloads")}

- Brand assets pack (mark, logotype, and icon in SVG): ${BRAND_ASSETS.url}`;
}
