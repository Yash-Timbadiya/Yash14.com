import { SITE_INFO } from "@/config/site";
import { USER } from "@/features/portfolio/data/user";
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links";

const content = `# ${SITE_INFO.name}

> A personal portfolio by ${USER.displayName} — a ${USER.jobTitle} based in ${USER.address}.

${USER.about.trim()}

## Docs

- [About](${SITE_INFO.url}/about.md): A quick intro to ${USER.displayName}, current work, and how to connect.
- [Bookmarks](${SITE_INFO.url}/bookmarks.md): Articles, courses, books, references, and tools I recommend.
- [Full context](${SITE_INFO.url}/llms-full.txt): Everything on this site in a single document.

## Connect

${SOCIAL_LINKS.map((item) => `- [${item.title}](${item.href})`).join("\n")}
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
