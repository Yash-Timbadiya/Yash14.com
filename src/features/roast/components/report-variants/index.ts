import type { ReportVariantProps } from "./shared";

import { SplitReport } from "./split-report";
import { EditorialReport } from "./editorial-report";

export type ReportVariant = {
  slug: string;
  name: string;
  description: string;
  Component: (props: ReportVariantProps) => React.ReactNode;
};

/** Candidate designs for the roast result, previewed at /roast/variants/[slug]. */
export const REPORT_VARIANTS: ReportVariant[] = [
  {
    slug: "split",
    name: "Split",
    description:
      "Speedometer, grade and Lighthouse gauges on the left; categories on the right with their score faded in behind each row.",
    Component: SplitReport,
  },
  {
    slug: "editorial",
    name: "Editorial",
    description:
      "A magazine feature: the verdict is the headline beside the speedometer, categories are numbered sections with footnotes.",
    Component: EditorialReport,
  },
];
