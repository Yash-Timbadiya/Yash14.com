import { getEducationMarkdown } from "@/lib/llms";
import { USER } from "@/features/portfolio/data/user";

const content = `# Education

> Where ${USER.displayName} studied, what they focused on, and what they built along the way.

${getEducationMarkdown()}
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
