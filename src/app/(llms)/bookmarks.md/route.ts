import { SITE_INFO } from "@/config/site";
import { getBookmarksMarkdown } from "@/lib/llms";
import { BOOKMARKS } from "@/features/bookmark/data";

const content = `# Bookmarks

> Hand-picked articles, courses, books, references, and tools worth your time.

${BOOKMARKS.length} bookmarks in total, grouped by category and newest first. They are also listed on ${SITE_INFO.url}/bookmarks, filterable by category, and in the RSS feed at ${SITE_INFO.url}/rss.

${getBookmarksMarkdown()}
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
