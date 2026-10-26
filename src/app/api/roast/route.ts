import type { RoastStreamEvent } from "@/features/roast/types";

import { z } from "zod";
import { SCAN_QUIPS } from "@/features/roast/data/roast-content";
import { buildDeadRoast } from "@/features/roast/lib/build-roast";
import {
  runRoast,
  displayDomain,
  normalizeRoastUrl,
} from "@/features/roast/lib/run-roast";
import {
  DeadSiteError,
  parseInputUrl,
  RoastInputError,
} from "@/features/roast/lib/safe-fetch";
import {
  takeRateLimit,
  getCachedRoast,
  setCachedRoast,
} from "@/features/roast/lib/roast-store";

// Lighthouse can take up to 80 s on heavy sites, then the AI roast up to 50 s.
export const maxDuration = 150;

const bodySchema = z.object({ url: z.string().trim().min(1).max(2048) });

/**
 * POST { url } and read back newline-delimited JSON: `log` lines while the
 * checks run, then one `result` (or `error`).
 */
export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "Send a URL to roast." }, { status: 400 });
  }

  let url: URL;
  try {
    url = parseInputUrl(body.data.url);
  } catch (error) {
    if (error instanceof DeadSiteError) {
      const input = body.data.url;
      return stream(async (send) => {
        send({
          type: "log",
          message: `> looking up ${input} ... nothing to look up`,
        });
        send({
          type: "result",
          result: buildDeadRoast({
            url: input,
            domain: input.toLowerCase(),
            reason: error.reason,
            detail: error.message,
          }),
        });
      });
    }
    if (error instanceof RoastInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const href = normalizeRoastUrl(url);
  const cached = await getCachedRoast(href);
  if (cached) {
    return stream(async (send) => {
      send({
        type: "log",
        message: SCAN_QUIPS.cached.replace("{domain}", displayDomain(url)),
      });
      send({ type: "result", result: { ...cached, cached: true } });
    });
  }

  const { allowed, retryAfterSeconds } = await takeRateLimit(clientIp(request));
  if (!allowed) {
    return Response.json(
      {
        error: `Easy, I can only roast so much. Try again in ${Math.ceil(retryAfterSeconds / 60)} min.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  return stream(async (send) => {
    const result = await runRoast(
      url,
      (message) => send({ type: "log", message }),
      request.signal,
    );
    await setCachedRoast(href, result);
    send({ type: "result", result });
  });
}

function stream(
  run: (send: (event: RoastStreamEvent) => void) => Promise<void>,
) {
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: RoastStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The visitor left; nothing to send to.
        }
      };

      try {
        await run(send);
      } catch (error) {
        if (error instanceof RoastInputError) {
          send({ type: "error", message: error.message });
        } else {
          console.error("[roast] failed", error);
          send({
            type: "error",
            message: "The roaster tripped over something. Try again.",
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by a cancelled request.
        }
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      // Stops proxies from buffering the stream into one late chunk.
      "X-Accel-Buffering": "no",
    },
  });
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}
