import { format } from "date-fns";
import { BOOKMARKS } from "@/features/bookmark/data";
import { BookmarkCategory } from "@/features/bookmark/types";
import { EDUCATION } from "@/features/portfolio/data/education";
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
