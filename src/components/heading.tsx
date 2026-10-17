export function createHeadingUrl(id: string) {
  if (typeof window === "undefined") {
    return `#${id}`;
  }

  const url = new URL(window.location.href);

  url.hash = id;

  return url.toString();
}
