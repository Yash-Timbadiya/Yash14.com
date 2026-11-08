"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { MONO_LABEL } from "@/features/home/lib/styles";
import { CopyStateIcon } from "@/components/copy-button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export type BrandColor = {
  name: string;
  description: string;
  hex: string;
  rgb: string;
  hsl: string;
  /** Classes for the sample block: its fill and a readable label color. */
  sampleClassName: string;
};

/** A color sample over its values, each one click to copy. */
export function ColorSwatch({ color }: { color: BrandColor }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-hairline">
      <div
        className={cn(
          "flex h-44 flex-col justify-between p-5",
          color.sampleClassName,
        )}
      >
        <span className="text-lg font-medium tracking-[-0.012em]">
          {color.name}
        </span>
        <span className="font-mono text-[0.8125rem] tracking-normal uppercase opacity-72">
          {color.hex}
        </span>
      </div>

      <p className="px-5 pt-4 text-[0.8125rem]/normal text-pretty text-ink/72">
        {color.description}
      </p>

      <dl className="mt-auto grid gap-px p-3">
        <ColorValue color={color.name} label="HEX" value={color.hex} />
        <ColorValue color={color.name} label="RGB" value={color.rgb} />
        <ColorValue color={color.name} label="HSL" value={color.hsl} />
      </dl>
    </article>
  );
}

function ColorValue({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  const { state, copy } = useCopyToClipboard({
    onCopySuccess: () => {
      trackEvent(ANALYTICS_EVENTS.COPY_BRAND_COLOR, {
        section: ANALYTICS_SECTIONS.BRAND_GUIDELINES,
        color,
        format: label,
      });
      toast.success(`${color} ${label} copied`);
    },
  });

  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <button
          type="button"
          className="group/value flex h-9 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors duration-150 hover:bg-ink/4"
          aria-label={`Copy ${color} ${label} ${value}`}
          onClick={() => copy(value)}
        >
          <span className={cn(MONO_LABEL, "w-8 shrink-0")}>{label}</span>
          <span className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] tracking-normal tabular-nums">
            {value}
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink/40 transition-colors group-hover/value:text-heat [&_svg]:size-3.5">
            <span className="font-mono text-xs tracking-normal opacity-0 transition-opacity group-hover/value:opacity-100 max-sm:hidden">
              Copy
            </span>
            <CopyStateIcon state={state} />
          </span>
        </button>
      </dd>
    </div>
  );
}
