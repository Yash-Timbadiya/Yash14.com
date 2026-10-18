import { SITE_INFO } from "@/config/site";
import { USER } from "@/features/portfolio/data/user";
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links";
import {
  getBookmarksMarkdown,
  getEducationMarkdown,
  getExperienceMarkdown,
} from "@/lib/llms";

const aboutText = `## About

${USER.about.trim()}

### Personal Information

- Name: ${USER.displayName}
- Pronouns: ${USER.pronouns}
- Job Title: ${USER.jobTitle}
- Location: ${USER.address}
- Website: ${USER.website}

### Work

${USER.jobs
  .map((job) => `- ${job.title} at [${job.company}](${job.website})`)
  .join("\n")}

### Social Links

${SOCIAL_LINKS.map((item) => `- [${item.title}](${item.href})`).join("\n")}

## Experience

${getExperienceMarkdown(3)}

## Education

${getEducationMarkdown(3)}

## Bookmarks

${getBookmarksMarkdown(3)}
`;

const content = `<SYSTEM>This document contains comprehensive information about ${USER.displayName}'s portfolio published on ${SITE_INFO.url}. It includes personal details, work experience, education, bookmarks, and social links. This data is formatted for consumption by Large Language Models (LLMs) to provide accurate and up-to-date information about ${USER.displayName}'s work as a ${USER.jobTitle}.</SYSTEM>

# ${SITE_INFO.name}

> A personal portfolio by ${USER.displayName} — a ${USER.jobTitle} based in ${USER.address}.

${aboutText}`;

export const revalidate = false;
export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
}
