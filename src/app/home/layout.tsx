import "@/styles/home.css";
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

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`home ${sans.variable} group/layout relative isolate`}>
      <AnnouncementBar />
      <HomeHeader />
      <main>{children}</main>
      <HomeFooter />
      <SiteBottomNav />
      <ScrollToTop />
    </div>
  );
}
