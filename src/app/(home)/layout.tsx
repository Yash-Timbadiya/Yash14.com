import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { SiteBottomNav } from "@/components/site-bottom-nav";
import { HomeFooter } from "@/features/home/components/home-footer";
import {
  AnnouncementBar,
  HomeHeader,
} from "@/features/home/components/home-header";

const ScrollToTop = dynamic(() =>
  import("@/components/scroll-to-top").then((mod) => mod.ScrollToTop),
);

// Loaded only on this route. No weight list: listing weights breaks Turbopack's
// dev font loader.
const sans = Inter({
  subsets: ["latin"],
  variable: "--home-font-sans",
  display: "swap",
  axes: ["opsz"],
});

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `.home` carries the site's design tokens (see globals.css).
    <div
      className={cn(
        "home group/layout relative isolate min-h-dvh overflow-x-clip bg-paper font-sans tracking-[-0.006em] text-ink [font-optical-sizing:auto]",
        sans.variable,
      )}
    >
      <AnnouncementBar />
      <HomeHeader />
      <main>{children}</main>
      <HomeFooter />
      <SiteBottomNav />
      <ScrollToTop />
    </div>
  );
}
