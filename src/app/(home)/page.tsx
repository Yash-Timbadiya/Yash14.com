import type { Metadata } from "next";
import type { ProfilePage, WithContext } from "schema-dts";

import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/lib/json-ld";
import { personJsonLd } from "@/config/json-ld";
import { USER } from "@/features/portfolio/data/user";
import { HomeHero } from "@/features/home/components/home-hero";
import { CtaSection } from "@/features/home/components/cta-section";
import { AboutSection } from "@/features/home/components/about-section";
import { StackSection } from "@/features/home/components/stack-section";
import { ProductsStrip } from "@/features/home/components/products-strip";
import { BookmarksSection } from "@/features/home/components/bookmarks-section";
import { EducationSection } from "@/features/home/components/education-section";
import { ExperienceSection } from "@/features/home/components/experience-section";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss", title: "Bookmarks RSS" }],
    },
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLdScript data={getProfilePageJsonLd()} />
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

function getProfilePageJsonLd(): WithContext<ProfilePage> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": absoluteUrl("/"),
    dateCreated: new Date(USER.dateCreated).toISOString(),
    dateModified: new Date().toISOString(),
    // Google requires mainEntity to be an inline Person; a bare @id reference
    // to a node not on the page fails with "Invalid object type".
    mainEntity: personJsonLd,
  };
}
