import { createHash } from "node:crypto";
// Syncs cdn/ to the Cloudflare R2 bucket served at assets.yash14.com.
// The path inside cdn/ becomes the URL path: cdn/logo/acme.png -> /logo/acme.png
//
// Usage (run `pnpm cdn:login` once first):
//   pnpm cdn:upload         upload new/changed files, delete removed ones
//   pnpm cdn:upload --yes   same, without the delete confirmation prompt
//
// R2 has no cheap "list objects" in wrangler, so the bucket keeps a manifest
// (MANIFEST_KEY) of every uploaded file and its MD5. Only files recorded in
// the manifest are ever deleted; objects uploaded some other way are untouched.
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const BUCKET = process.env.R2_BUCKET || "yash14-assets";
const DIR = "cdn";
const MANIFEST_KEY = ".cdn-manifest.json";
const WRANGLER =
  "pnpm dlx --allow-build=esbuild --allow-build=workerd wrangler";

// Wrangler stores SVGs with an empty or application/xml type, which browsers
// refuse to render in <img>, so common types are set explicitly.
const CONTENT_TYPES = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  ico: "image/x-icon",
  mp3: "audio/mpeg",
  zip: "application/zip",
  pdf: "application/pdf",
  json: "application/json",
};

function contentTypeFlag(key) {
  const type = CONTENT_TYPES[key.split(".").pop()?.toLowerCase()];
  return type ? ` --content-type "${type}"` : "";
}

function wrangler(args, options = {}) {
  return execSync(`${WRANGLER} ${args}`, {
    stdio: ["inherit", "pipe", "inherit"],
    encoding: "utf8",
    ...options,
  });
}

function readRemoteManifest() {
  try {
    const out = wrangler(
      `r2 object get "${BUCKET}/${MANIFEST_KEY}" --pipe --remote`,
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    return JSON.parse(out.slice(out.indexOf("{")));
  } catch {
    return {}; // first run: no manifest yet
  }
}

function writeRemoteManifest(manifest) {
  wrangler(
    `r2 object put "${BUCKET}/${MANIFEST_KEY}" --pipe --content-type "application/json" --cache-control "no-store" --remote`,
    {
      input: JSON.stringify(manifest, null, 2),
      stdio: ["pipe", "pipe", "inherit"],
    },
  );
}

if (!existsSync(DIR)) {
  console.error(`No ${DIR}/ folder found. Aborting so nothing gets deleted.`);
  process.exit(1);
}

const local = Object.fromEntries(
  readdirSync(DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const path = `${entry.parentPath}/${entry.name}`;
      const key = path.slice(DIR.length + 1).replaceAll("\\", "/");
      const md5 = createHash("md5").update(readFileSync(path)).digest("hex");
      return [key, md5];
    }),
);

if (Object.keys(local).length === 0) {
  console.error(`${DIR}/ is empty. Aborting so nothing gets deleted.`);
  process.exit(1);
}

const remote = readRemoteManifest();
const toUpload = Object.keys(local).filter((key) => remote[key] !== local[key]);
const toDelete = Object.keys(remote).filter((key) => !(key in local));

if (toUpload.length === 0 && toDelete.length === 0) {
  console.log("Everything is up to date.");
  process.exit(0);
}

const manifest = { ...remote };
try {
  for (const key of toUpload) {
    console.log(`${key in remote ? "~ update" : "+ upload"}  ${key}`);
    wrangler(
      `r2 object put "${BUCKET}/${key}" --file "${DIR}/${key}" --cache-control "public, max-age=31536000, immutable"${contentTypeFlag(key)} --remote`,
    );
    manifest[key] = local[key];
  }

  if (toDelete.length > 0) {
    console.log(`\nRemoved from ${DIR}/, will be deleted from R2:`);
    for (const key of toDelete) console.log(`- ${key}`);

    let confirmed = process.argv.includes("--yes");
    // Without a TTY the prompt never settles and Node exits before `finally`
    // writes the manifest, so treat non-interactive runs as "no".
    if (!confirmed && process.stdin.isTTY) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      confirmed = /^y(es)?$/i.test(
        (await rl.question("Delete these? (y/N) ")).trim(),
      );
      rl.close();
    }

    if (confirmed) {
      for (const key of toDelete) {
        wrangler(`r2 object delete "${BUCKET}/${key}" --remote`);
        delete manifest[key];
      }
    } else {
      console.log("Skipped deletions.");
    }
  }
} finally {
  writeRemoteManifest(manifest);
}

console.log("\nDone.");
