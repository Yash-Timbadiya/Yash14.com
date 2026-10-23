// Plain JS so both the LinkPreview component and the capture script
// (src/scripts/capture-link-previews.mjs) name fallback screenshots the same way.

/**
 * Maps a URL to its fallback screenshot name, ignoring the query string so
 * UTM params do not change it: `https://x.com/iamncdai?utm_source=a` -> `x-com-iamncdai`.
 *
 * @param {string} url
 * @returns {string | null}
 */
export function getLinkPreviewSlug(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const slug = `${hostname.replace(/^www\./, "")}${pathname}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || null;
  } catch {
    return null;
  }
}

/** Where fallback screenshots live, both in `cdn/` and on the CDN. */
export const LINK_PREVIEW_DIR = "link-previews";
