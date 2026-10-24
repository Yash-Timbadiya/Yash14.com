import type { ReportVariantProps } from "./shared";

import { ReceiptReport } from "./receipt-report";
import { TerminalReport } from "./terminal-report";
import { EditorialReport } from "./editorial-report";
import { ScorecardReport } from "./scorecard-report";
import { HeatTilesReport } from "./heat-tiles-report";
import { ReportCardReport } from "./report-card-report";
import {
  ScorecardChipsReport,
  ScorecardRingsReport,
  ScorecardSplitReport,
  ScorecardPriorityReport,
  ScorecardSegmentsReport,
} from "./scorecard-variants";

export type ReportVariant = {
  slug: string;
  name: string;
  description: string;
  Component: (props: ReportVariantProps) => React.ReactNode;
};

/** Candidate designs for the roast result, previewed at /roast/variants/[slug]. */
export const REPORT_VARIANTS: ReportVariant[] = [
  {
    slug: "scorecard",
    name: "Scorecard",
    description:
      "Animated score gauge, then categories as a dense table. Click a row for its fixes.",
    Component: ScorecardReport,
  },
  {
    slug: "receipt",
    name: "Receipt",
    description:
      "The roast as a printed receipt. Fixes are the itemized bill; the CTA says pay up.",
    Component: ReceiptReport,
  },
  {
    slug: "report-card",
    name: "Report card",
    description:
      "Letter grades per subject, teacher's comments, a rotated grade stamp and detention notes.",
    Component: ReportCardReport,
  },
  {
    slug: "terminal",
    name: "Terminal",
    description:
      "The scan log keeps going: ASCII bars, PASS/WARN/FAIL tags and clickable fix commands.",
    Component: TerminalReport,
  },
  {
    slug: "editorial",
    name: "Editorial",
    description:
      "A magazine feature: the verdict is the headline, categories are numbered sections with footnotes.",
    Component: EditorialReport,
  },
  {
    slug: "heat-tiles",
    name: "Heat tiles",
    description:
      "A heatmap of six tiles that glow hotter the worse they did. Pick a tile to read its roast.",
    Component: HeatTilesReport,
  },
  {
    slug: "scorecard-split",
    name: "Scorecard · split",
    description:
      "Scorecard with the gauge, grade and Lighthouse bars in a left column that stays in view.",
    Component: ScorecardSplitReport,
  },
  {
    slug: "scorecard-segments",
    name: "Scorecard · segments",
    description:
      "The gauge is split into one arc per category. Hover a row to light up its arc.",
    Component: ScorecardSegmentsReport,
  },
  {
    slug: "scorecard-rings",
    name: "Scorecard · Lighthouse rings",
    description:
      "Main gauge plus four small Lighthouse rings; categories get letter-grade badges.",
    Component: ScorecardRingsReport,
  },
  {
    slug: "scorecard-priority",
    name: "Scorecard · priority",
    description:
      "A speedometer with a needle, the worst category first (open, marked Fix first), passing ones folded.",
    Component: ScorecardPriorityReport,
  },
  {
    slug: "scorecard-chips",
    name: "Scorecard · issue chips",
    description:
      "Every problem is visible as a chip on its row; click a chip to see just its fixes.",
    Component: ScorecardChipsReport,
  },
];
