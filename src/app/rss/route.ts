import { SITE_INFO } from "@/config/site";
import { BOOKMARKS } from "@/features/bookmark/data";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";

export const revalidate = false;
export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = sortBookmarksNewestFirst(BOOKMARKS)
    .map((bookmark) => {
      const description = [
        bookmark.category,
        bookmark.author && `by ${bookmark.author}`,
        bookmark.why,
      ]
        .filter(Boolean)
        .join(" · ");

      return `    <item>
      <title>${escapeXml(bookmark.title)}</title>
      <link>${escapeXml(bookmark.url)}</link>
      <guid isPermaLink="true">${escapeXml(bookmark.url)}</guid>
      <category>${escapeXml(bookmark.category)}</category>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(bookmark.bookmarkedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bookmarks | ${escapeXml(SITE_INFO.name)}</title>
    <link>${SITE_INFO.url}/bookmarks</link>
    <description>Hand-picked articles, courses, books, and references worth your time.</description>
    <language>en</language>
    <atom:link href="${SITE_INFO.url}/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
