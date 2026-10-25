"use client";

import type { LucideIcon } from "lucide-react";
import type { RoastResult } from "@/features/roast/types";
import type { ExportFormat } from "@/features/roast/lib/export-report";

import { Button } from "@/components/ui/button";
import { exportReport } from "@/features/roast/lib/export-report";
import {
  GlobeIcon,
  BracesIcon,
  FileCodeIcon,
  FileTextIcon,
  DownloadIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FORMATS: { format: ExportFormat; label: string; icon: LucideIcon }[] = [
  { format: "pdf", label: "Export as PDF", icon: FileTextIcon },
  { format: "markdown", label: "Export as Markdown", icon: FileCodeIcon },
  { format: "html", label: "Export as HTML", icon: GlobeIcon },
  { format: "json", label: "Export as JSON", icon: BracesIcon },
];

export function ExportMenu({
  result,
  onExport,
}: {
  result: RoastResult;
  onExport?: (format: ExportFormat) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <DownloadIcon />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-52">
        {FORMATS.map(({ format, label, icon: Icon }) => (
          <DropdownMenuItem
            key={format}
            className="gap-3 px-3 py-2"
            onSelect={() => {
              exportReport(result, format);
              onExport?.(format);
            }}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
