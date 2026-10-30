import type { Metadata } from "next";

import { config } from "@/config";
import { notFound } from "next/navigation";
import { YTMarkIsometricOg } from "@/features/portfolio/components/yt-mark-isometric/yt-mark-isometric-og";

export const metadata: Metadata = {
  title: "OG Image",
  robots: { index: false, follow: false },
};

// Dev-only canvas for capturing the static OG image uploaded to the CDN.
export default function OgImagePage() {
  if (config.app.env === "production") notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800 p-8">
      <div
        id="og-image"
        className="dark flex h-157.5 w-300 shrink-0 items-center justify-center overflow-hidden bg-background px-24 text-foreground"
      >
        <YTMarkIsometricOg />
      </div>
    </div>
  );
}
