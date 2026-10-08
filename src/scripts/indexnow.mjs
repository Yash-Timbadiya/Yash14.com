// Submits every URL in the live sitemap to IndexNow.
// The key file must already be deployed at https://yash14.com/{key}.txt.
//
// Usage (after a production deploy):
//   pnpm indexnow
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const HOST = "yash14.com";
const ORIGIN = `https://${HOST}`;
const PUBLIC_DIR = path.join(process.cwd(), "public");

function loadKey() {
  const file = readdirSync(PUBLIC_DIR).find((name) =>
    /^[a-f0-9]{8,128}\.txt$/i.test(name),
  );
  if (!file) {
    throw new Error("Missing public/{key}.txt IndexNow key file");
  }

  const key = readFileSync(path.join(PUBLIC_DIR, file), "utf8").trim();
  const expected = file.replace(/\.txt$/i, "");
  if (key.toLowerCase() !== expected.toLowerCase()) {
    throw new Error(`Key file ${file} must contain exactly "${expected}"`);
  }

  return key;
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(
    (match) => match[1],
  );
}

const key = loadKey();
const sitemapResponse = await fetch(`${ORIGIN}/sitemap.xml`);
if (!sitemapResponse.ok) {
  throw new Error(`Sitemap fetch failed: ${sitemapResponse.status}`);
}

const urlList = parseLocs(await sitemapResponse.text());
if (urlList.length === 0) {
  throw new Error("Sitemap has no URLs");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList,
  }),
});

const body = await response.text();
console.log(
  `IndexNow ${response.status}${body ? `: ${body}` : ""}`,
);
console.log(`Submitted ${urlList.length} URL(s)`);

if (response.status !== 200 && response.status !== 202) {
  process.exitCode = 1;
}
