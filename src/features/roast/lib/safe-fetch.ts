import "server-only";

import type { DeadSiteReason } from "@/features/roast/types";

import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export const ROAST_USER_AGENT =
  "Mozilla/5.0 (compatible; Yash14RoastBot/1.0; +https://yash14.com/roast)";

const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 5 * 1024 * 1024;
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/** The input can't be roasted at all (bad scheme, private address). */
export class RoastInputError extends Error {}

/** The site doesn't load. It still gets roasted, just harder. */
export class DeadSiteError extends Error {
  constructor(
    readonly reason: DeadSiteReason,
    message: string,
  ) {
    super(message);
  }
}

export function parseInputUrl(input: string): URL {
  const trimmed = input.trim();
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new DeadSiteError("not_a_domain", `"${trimmed}" is not a URL.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RoastInputError("Only http and https URLs can be roasted.");
  }
  if (url.username || url.password) {
    throw new RoastInputError("URLs with credentials are not allowed.");
  }

  url.hash = "";
  const hostname = stripBrackets(url.hostname);
  if (isBlockedHostname(hostname)) {
    throw new RoastInputError("That address is not allowed.");
  }
  if (!isIP(hostname) && !DOMAIN_PATTERN.test(hostname)) {
    throw new DeadSiteError("not_a_domain", `"${hostname}" is not a domain.`);
  }

  return url;
}

/** Resolves the host and rejects anything that lands on a private network. */
export async function assertPublicHost(url: URL) {
  const hostname = stripBrackets(url.hostname);

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new RoastInputError("That address is not allowed.");
    }
    return;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new DeadSiteError(
      "dns_not_found",
      `${hostname} does not resolve to any server.`,
    );
  }

  if (addresses.length === 0) {
    throw new DeadSiteError(
      "dns_not_found",
      `${hostname} does not resolve to any server.`,
    );
  }
  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new RoastInputError("That address resolves to a private network.");
  }
}

type SafeFetchOptions = {
  method?: "GET" | "HEAD";
  accept?: string;
  timeoutMs: number;
  signal?: AbortSignal;
};

/**
 * fetch() with redirects followed by hand, so every hop is checked against
 * private networks before the request goes out.
 */
export async function safeFetch(
  url: URL,
  { method = "GET", accept = "*/*", timeoutMs, signal }: SafeFetchOptions,
) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let current = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(current);

    const response = await fetch(current, {
      method,
      redirect: "manual",
      signal: combined,
      cache: "no-store",
      headers: { "User-Agent": ROAST_USER_AGENT, Accept: accept },
    });

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      current = new URL(location, current);
      if (current.protocol !== "http:" && current.protocol !== "https:") {
        throw new RoastInputError("Redirected to a non-http URL.");
      }
      continue;
    }

    return { response, finalUrl: current };
  }

  throw new DeadSiteError("unreachable", "Too many redirects.");
}

export async function readTextLimited(
  response: Response,
  maxBytes = MAX_HTML_BYTES,
) {
  if (!response.body) return { text: "", bytes: 0 };

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(Math.min(bytes, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { text: new TextDecoder().decode(merged), bytes };
}

export type FetchedPage = {
  html: string;
  finalUrl: URL;
  status: number;
  headers: Headers;
  /** Time until the response headers arrived, redirects included. */
  responseTimeMs: number;
  bytes: number;
};

export async function fetchPage(
  url: URL,
  signal?: AbortSignal,
): Promise<FetchedPage> {
  const startedAt = performance.now();

  try {
    const { response, finalUrl } = await safeFetch(url, {
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      timeoutMs: 10_000,
      signal,
    });
    const responseTimeMs = Math.round(performance.now() - startedAt);

    if (response.status >= 400) {
      await response.body?.cancel();
      throw new DeadSiteError(
        "http_error",
        `The homepage answered with HTTP ${response.status}.`,
      );
    }

    const { text, bytes } = await readTextLimited(response);
    return {
      html: text,
      finalUrl,
      status: response.status,
      headers: response.headers,
      responseTimeMs,
      bytes,
    };
  } catch (error) {
    if (error instanceof DeadSiteError || error instanceof RoastInputError) {
      throw error;
    }
    if (
      error instanceof DOMException &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new DeadSiteError("timeout", "No response within 10 seconds.");
    }
    throw new DeadSiteError(
      "unreachable",
      "The server refused the connection or its TLS certificate is broken.",
    );
  }
}

function stripBrackets(hostname: string) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function isBlockedHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".home.arpa")
  );
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  if (version === 6) {
    const lower = address.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      lower === "::" ||
      lower === "::1" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb") ||
      lower.startsWith("64:ff9b:")
    );
  }

  return true;
}
