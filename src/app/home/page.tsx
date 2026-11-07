import type { Metadata } from "next";

import { HomeHero } from "@/features/home/components/home-hero";
import { CtaSection } from "@/features/home/components/cta-section";
import { AboutSection } from "@/features/home/components/about-section";
import { StackSection } from "@/features/home/components/stack-section";
import { ProductsStrip } from "@/features/home/components/products-strip";
import { BookmarksSection } from "@/features/home/components/bookmarks-section";
import { EducationSection } from "@/features/home/components/education-section";
import { ExperienceSection } from "@/features/home/components/experience-section";

// A preview of the redesign, so it stays out of search until it replaces "/".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function HomeRedesignPage() {
  return (
    <>
      <HomeHero />
      <ProductsStrip />
      <AboutSection />
      <StackSection />
      <ExperienceSection />
      <EducationSection />
      <BookmarksSection />
      <CtaSection />
    </>
  );
}
