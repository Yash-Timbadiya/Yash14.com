import { getExperienceMarkdown } from "@/lib/llms";
import { USER } from "@/features/portfolio/data/user";

const content = `# Experience

> Where ${USER.displayName} has worked, newest first, with each role's period, skills, and what was built there.

${getExperienceMarkdown()}
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
