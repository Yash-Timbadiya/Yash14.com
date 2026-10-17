# CDN Assets (Cloudflare R2) — Instructions

How images, audio and downloads are served from Cloudflare R2 instead of Vercel's
`public/` folder, and how to add, update or remove them.

- **Bucket:** `yash14-assets` (Cloudflare R2, free tier: 10 GB storage, free egress)
- **Public URL:** `https://assets.yash14.com` (R2 custom domain, cached by Cloudflare CDN)
- **Local folder:** `cdn/` (gitignored — not committed, not deployed to Vercel)
- **Upload command:** `pnpm cdn:upload`

> The path inside `cdn/` becomes the URL path:
> `cdn/logo/acme.png` → `https://assets.yash14.com/logo/acme.png`

---

## How it works

```
cdn/                                   ← local copies of CDN files (gitignored)
  │
  ▼  pnpm cdn:upload  (src/scripts/upload-cdn.mjs, uses wrangler)
R2 bucket "yash14-assets"
  │
  ▼  custom domain
https://assets.yash14.com/...          ← served + cached by Cloudflare
  ▲
  │  cdn("/logo/acme.png")             (src/utils/cdn.ts)
Next.js site on Vercel
```

| File | Purpose |
| --- | --- |
| `src/utils/cdn.ts` | `cdn(path)` → full CDN URL. Use this everywhere instead of hardcoding the domain. |
| `src/config.ts` | `config.cdn.url` — reads `NEXT_PUBLIC_CDN_URL`, defaults to `https://assets.yash14.com`. |
| `next.config.ts` | `images.remotePatterns` allows `assets.yash14.com` for `next/image`. |
| `src/scripts/upload-cdn.mjs` | Syncs `cdn/` → R2 (upload new/changed, delete removed). |
| `src/scripts/r2-cors.json` | CORS policy for the bucket (needed for `fetch()`-loaded files like audio). |
| `.gitignore` | Ignores `/cdn/`. |

### Files currently on the CDN

| CDN path | Used in |
| --- | --- |
| `assets/yash.webp` | `USER.avatar` (`src/features/portfolio/data/user.ts`) — profile photo, vCard, JSON-LD |
| `audio/yashtimbadiya.mp3` | `USER.namePronunciationUrl` — "pronounce my name" button |
| `logo/crosseven.png` | `EXPERIENCES` (`src/features/portfolio/data/experiences.tsx`) |
| `logo/enacton.png` | `EXPERIENCES` |
| `assets/yash14-brand.zip` | `BRAND_ASSETS.url` (`src/config/site.ts`) — brand kit download |

### What must stay in `public/`

Do **not** move these to the CDN:

- `public/logo/favicon*`, `apple-touch-icon.png` — browsers and the web manifest expect them on the site's own domain.
- `public/assets/yash14-brand/*.svg` — the `<a download>` attribute only works for same-origin files; on the CDN they'd open in a tab instead of downloading.
- `public/brand.md`.

---

## Everyday usage

### Add a new file

1. Put the file in `cdn/` in the folder you want:
   ```
   cdn/projects/my-app.png
   ```
2. Upload:
   ```powershell
   pnpm cdn:upload
   ```
3. Use it in code:
   ```tsx
   import { cdn } from "@/utils/cdn";

   <Image src={cdn("/projects/my-app.png")} alt="My App" width={800} height={450} />
   ```
4. Commit + push (only the code changes — `cdn/` is not committed).

### Change an existing file

Files are cached for **1 year** (`Cache-Control: public, max-age=31536000, immutable`),
so browsers and the Cloudflare edge may keep serving the old version.

- **Recommended:** save it under a new name (`my-app-v2.png`), delete the old one,
  run `pnpm cdn:upload`, and update the `cdn()` path in code.
- **Or** keep the name, run `pnpm cdn:upload`, then purge the URL (see
  [Purge the Cloudflare cache](#purge-the-cloudflare-cache)). Visitors' browsers
  may still show the old one until their cache clears.

### Delete a file

1. Remove it from `cdn/` and remove its `cdn()` usage from code.
2. Run `pnpm cdn:upload`. It lists the files to delete and asks `Delete these? (y/N)`.
   Use `pnpm cdn:upload --yes` to skip the prompt.

---

## How `pnpm cdn:upload` syncs

Wrangler can't list the objects in a bucket, so the script keeps a manifest
**in the bucket** at `.cdn-manifest.json` (file path → MD5 hash). On each run it
compares that manifest with `cdn/`:

| Change in `cdn/` | Result |
| --- | --- |
| New file | `+ upload` |
| Same name, content changed | `~ update` |
| Unchanged | skipped |
| File deleted | listed, deleted from R2 after confirmation |
| Nothing changed | `Everything is up to date.` |

Notes:

- Re-uploading the same name **overwrites** — R2 never creates duplicates.
- The manifest lives in R2, so syncing works the same from any machine.
- The manifest is publicly readable at `https://assets.yash14.com/.cdn-manifest.json`
  (it only contains file names and hashes).

### Safety guards

- If `cdn/` is **missing or empty**, the script aborts and deletes nothing. This
  protects the bucket when you clone the repo on a new machine (since `cdn/` is
  gitignored). On a new machine, restore `cdn/` from a backup before syncing.
- Only files listed in the manifest are ever deleted. Anything uploaded by hand in
  the Cloudflare dashboard is left alone.
- `cdn/` is not in git, so **R2 is the only other copy**. Keep your own backup of
  anything important.

---

## Commands

All commands run from `portfolio/` in PowerShell (no bash needed).

| Command | What it does |
| --- | --- |
| `pnpm cdn:login` | Log wrangler in to Cloudflare (browser opens). Needed once, or when the login expires. |
| `pnpm cdn:upload` | Sync `cdn/` → R2. |
| `pnpm cdn:upload --yes` | Same, without the delete confirmation. |

Use a different bucket with `$env:R2_BUCKET = "other-bucket"; pnpm cdn:upload`.

Wrangler isn't a project dependency — it runs through `pnpm dlx`, with
`--allow-build=esbuild --allow-build=workerd` so pnpm doesn't prompt about build
scripts. It's kept out of `devDependencies` so Vercel doesn't install it on every build.

Other useful wrangler commands (prefix each with
`pnpm dlx --allow-build=esbuild --allow-build=workerd`):

```powershell
wrangler r2 bucket list                                    # list buckets
wrangler r2 object get yash14-assets/logo/enacton.png --file out.png --remote
wrangler r2 bucket cors list yash14-assets                 # show CORS rules
```

---

## One-time setup (already done)

Kept here in case the bucket ever needs to be recreated.

1. **Create the bucket** — Cloudflare dashboard → R2 → Create bucket → `yash14-assets`.
2. **Connect the domain** — bucket → Settings → Custom Domains → Add →
   `assets.yash14.com`. Because `yash14.com` is on Cloudflare DNS, the DNS record and
   SSL certificate are created automatically. Wait until Status is **Active**.
   Keep the `r2.dev` URL disabled (it's rate-limited, not for production).
3. **Set CORS** — required for files the site loads with `fetch()` (the name
   pronunciation audio uses the Web Audio API, which fetches the MP3). Images don't
   need it.
   ```powershell
   pnpm dlx --allow-build=esbuild --allow-build=workerd wrangler r2 bucket cors set yash14-assets --file src/scripts/r2-cors.json --force
   ```
   After changing CORS, [purge the cache](#purge-the-cloudflare-cache) for already
   cached files — the Cloudflare edge keeps serving the old response without the
   `Access-Control-Allow-Origin` header until it's purged.
4. **Log in and upload** — `pnpm cdn:login`, then `pnpm cdn:upload`.
5. **Vercel (optional)** — Settings → Environment Variables →
   `NEXT_PUBLIC_CDN_URL=https://assets.yash14.com`. Also add it to the local `.env`.
   The code already defaults to this value.

---

## Troubleshooting

### Purge the Cloudflare cache

Cloudflare dashboard → `yash14.com` → **Caching** → **Configuration** →
**Purge Cache** → **Custom Purge** → **URL** → paste the full URL, e.g.
`https://assets.yash14.com/audio/yashtimbadiya.mp3` → Purge.

### Image/audio works when opened directly but not on the site

- **Audio / anything loaded with `fetch()`:** check CORS.
  ```bash
  curl -sI -H "Origin: https://yash14.com" https://assets.yash14.com/audio/yashtimbadiya.mp3 | grep -i access-control
  ```
  It must print `Access-Control-Allow-Origin: *`. If not, set CORS (setup step 3)
  and purge the URL.
- **`next/image` error "hostname is not configured":** add the host to
  `images.remotePatterns` in `next.config.ts`.

### 404 on `assets.yash14.com`

The file isn't in the bucket or the path doesn't match. The URL path must equal the
path inside `cdn/` (case-sensitive). Run `pnpm cdn:upload`.

### "Not logged in" / authentication errors

Run `pnpm cdn:login` again.

### pnpm asks "Choose which packages to build"

Only happens if wrangler is run without the `--allow-build` flags. Select both
(`esbuild`, `workerd`) with Space and press Enter, or use the `pnpm cdn:*` scripts.
