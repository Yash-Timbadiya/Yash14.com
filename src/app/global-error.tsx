"use client";

import { useEffect } from "react";
import NextError from "next/error";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // Next.js handles errors that reach this boundary before Sentry's global
  // handlers can see them, so they have to be reported explicitly.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* The App Router does not expose the status code here. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
