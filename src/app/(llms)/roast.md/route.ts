import { getRoastMarkdown } from "@/lib/llms";

const content = `# Roast My Site

${getRoastMarkdown()}
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
