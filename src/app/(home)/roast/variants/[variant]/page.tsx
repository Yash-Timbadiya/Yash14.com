import type { Metadata } from "next";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocContainer } from "@/features/doc/components/doc-layout";
import { SAMPLE_ROAST_RESULT } from "@/features/roast/data/sample-result";
import { REPORT_VARIANTS } from "@/features/roast/components/report-variants";

// Design previews for picking a result layout. Not part of the live site.
export const metadata: Metadata = {
  title: "Roast report variants",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return REPORT_VARIANTS.map(({ slug }) => ({ variant: slug }));
}

export default async function RoastVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { variant: slug } = await params;
  const index = REPORT_VARIANTS.findIndex((v) => v.slug === slug);
  const variant = REPORT_VARIANTS.at(index);
  if (index === -1 || !variant) notFound();

  const { Component } = variant;

  return (
    <DocContainer>
      <div className="h-12" />
      <div className="screen-line-bottom h-px" />

      <div className="flex items-center justify-between p-2 pl-4">
        <Button
          className="h-7 gap-2 border-none px-0 text-muted-foreground hover:text-foreground hover:no-underline"
          variant="link"
          size="sm"
          asChild
        >
          <Link href="/roast">
            <ArrowLeftIcon />
            Roast
          </Link>
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          Preview with fixed data · dev only
        </span>
      </div>

      <nav
        aria-label="Report variants"
        className="screen-line-top screen-line-bottom flex flex-wrap gap-1.5 p-4"
      >
        {REPORT_VARIANTS.map((v, i) => (
          <Link
            key={v.slug}
            href={`/roast/variants/${v.slug}`}
            aria-current={v.slug === slug ? "page" : undefined}
            className={cn(
              "rounded-md border border-line px-2.5 py-1 font-mono text-xs hover:bg-muted",
              v.slug === slug &&
                "border-foreground bg-foreground text-background hover:bg-foreground",
            )}
          >
            {i + 1}. {v.name}
          </Link>
        ))}
      </nav>

      <div className="screen-line-bottom space-y-1 p-4">
        <h1 className="text-2xl font-medium tracking-tight">
          Variant {index + 1} of {REPORT_VARIANTS.length}: {variant.name}
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          {variant.description}
        </p>
      </div>

      <div className="stripe-divider h-4 w-full" />

      <div className="screen-line-top">
        <Component result={SAMPLE_ROAST_RESULT} />
      </div>

      <div className="stripe-divider h-8 w-full" />
    </DocContainer>
  );
}
