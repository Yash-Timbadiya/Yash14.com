import { getTechStackMarkdown } from "@/lib/llms";
import { USER } from "@/features/portfolio/data/user";
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links";

const content = `# About

${USER.about.trim()}

## Personal Information

- Name: ${USER.displayName}
- Pronouns: ${USER.pronouns}
- Job Title: ${USER.jobTitle}
- Location: ${USER.address}
- Website: ${USER.website}

## Work

${USER.jobs
  .map((job) => `- ${job.title} at [${job.company}](${job.website})`)
  .join("\n")}

## Stack

${getTechStackMarkdown(3)}

## Social Links

${SOCIAL_LINKS.map((item) => `- [${item.title}](${item.href}) — ${item.handle}`).join("\n")}
`;

export const revalidate = false;
export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
}
