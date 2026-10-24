import { getBrandMarkdown } from "@/lib/llms";

const content = `# YT Brand

${getBrandMarkdown()}
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
