import "server-only";
import * as cheerio from "cheerio";

const MAX_HEADINGS = 10;
const MAX_EXCERPT_CHARS = 2000;

/** The words a visitor actually reads, so the AI can roast the copy itself. */
export type PageCopy = {
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  ogTitle: string;
  ogDescription: string;
  ctaLabels: string[];
  bodyExcerpt: string;
};

function clean(text: string | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function extractPageCopy(html: string): PageCopy {
  const $ = cheerio.load(html);
  const texts = (selector: string) =>
    $(selector)
      .toArray()
      .map((el) => clean($(el).text()))
      .filter(Boolean)
      .slice(0, MAX_HEADINGS);

  const body = $("body").clone();
  body.find("script, style, noscript, svg, template").remove();

  return {
    title: clean($("title").first().text()),
    metaDescription: clean($('meta[name="description"]').attr("content")),
    h1: texts("h1"),
    h2: texts("h2"),
    ogTitle: clean($('meta[property="og:title"]').attr("content")),
    ogDescription: clean($('meta[property="og:description"]').attr("content")),
    ctaLabels: [
      ...new Set(texts("button, a[class*='btn'], a[class*='button']")),
    ],
    bodyExcerpt: clean(body.text()).slice(0, MAX_EXCERPT_CHARS),
  };
}
