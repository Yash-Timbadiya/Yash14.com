"use client";

import type { RoastResult, RoastStreamEvent } from "@/features/roast/types";

import { useRef, useState, useEffect } from "react";

export type RoastPhase = "idle" | "scanning" | "done" | "error";

/** Posts to /api/roast and follows its NDJSON stream. */
export function useRoast() {
  const [phase, setPhase] = useState<RoastPhase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function start(url: string): Promise<RoastResult | null> {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("scanning");
    setLogs([]);
    setResult(null);
    setError(null);

    const fail = (message: string) => {
      setError(message);
      setPhase("error");
      return null;
    };

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        return fail(body?.error ?? "Something broke. Try again.");
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as RoastStreamEvent;

          if (event.type === "log") {
            setLogs((previous) => [...previous, event.message]);
          } else if (event.type === "result") {
            setResult(event.result);
            setPhase("done");
            return event.result;
          } else {
            return fail(event.message);
          }
        }
      }

      return fail("The roast ended early. Try again.");
    } catch (caught) {
      if (controller.signal.aborted) return null;
      console.error(caught);
      return fail("Couldn't reach the roaster. Check your connection.");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("idle");
    setLogs([]);
    setResult(null);
    setError(null);
  }

  return { phase, logs, result, error, start, reset };
}
