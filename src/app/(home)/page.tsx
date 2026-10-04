import type { Metadata } from "next";
import type { ProfilePage, WithContext } from "schema-dts";

import { JsonLdScript } from "@/lib/json-ld";
import { absoluteUrl, cn } from "@/lib/utils";
import { personJsonLd } from "@/config/json-ld";
import { USER } from "@/features/portfolio/data/user";
import { Hello } from "@/features/portfolio/components/hello";
import { Overview } from "@/features/portfolio/components/overview";
import { Education } from "@/features/portfolio/components/education";
import { TechStack } from "@/features/portfolio/components/tech-stack";
import { Experiences } from "@/features/portfolio/components/experiences";
import { SocialLinks } from "@/features/portfolio/components/social-links";
import { ProfileHeader } from "@/features/portfolio/components/profile-header";
import { GitHubContributions } from "@/features/portfolio/components/github-contributions";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLdScript data={getProfilePageJsonLd()} />

      <div className="[--separator-height:--spacing(8)] **:data-[slot=panel]:scroll-mt-[calc(var(--header-height)+var(--separator-height))]">
        <div className="mx-auto md:max-w-4xl">
          <ProfileHeader />
          <Separator />

          <Overview />
          <SocialLinks />
          <GitHubContributions />
          <Separator />

          <Hello />
          <Separator />

          <TechStack />
          <Separator />

          <Experiences />
          <Separator />

          <Education />
          <Separator />
        </div>
      </div>
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

function Separator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "stripe-divider h-(--separator-height) w-full border-x border-line",
        className,
      )}
    ></div>
  );
}
