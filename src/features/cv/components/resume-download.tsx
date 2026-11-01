"use client";

import { cn } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";
import { RESUME_PDF_URL } from "@/features/cv/data/cv";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";

/**
 * Links to the PDF resume on the CDN. Browsers ignore `download` on
 * cross-origin links, so it opens in a new tab where the PDF viewer offers
 * the save button.
 */
export function ResumeDownload() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative touch-manipulation border-none",
            )}
            href={RESUME_PDF_URL}
            target="_blank"
            rel="noopener"
            download
            aria-label="Download resume (PDF)"
          >
            <DownloadIcon aria-hidden />
          </a>
        }
      />
      <TooltipContent className="px-3">Download resume</TooltipContent>
    </Tooltip>
  );
}
