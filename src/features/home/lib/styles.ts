/**
 * Tailwind class strings for patterns shared across the site's sections. One
 * place to retune them; everything else lives on the elements themselves.
 * Colors come from the tokens on `.home` in globals.css (`paper`, `ink`,
 * `hairline`, `heat`...).
 */

/** A full-bleed rule across the page. */
export const BAND = "relative border-t border-hairline";

/**
 * The centred column between the two rails, with a star where each rail meets
 * the rule above. Written out in full so Tailwind can find every class.
 */
export const FRAME =
  "relative mx-auto w-[calc(100%-1.25rem)] max-w-7xl border-x border-hairline before:pointer-events-none before:absolute before:-top-2 before:-left-2 before:z-2 before:size-[15px] before:bg-hairline-strong before:mask-(--star) before:mask-contain before:mask-center before:mask-no-repeat after:pointer-events-none after:absolute after:-top-2 after:-right-2 after:z-2 after:size-[15px] after:bg-hairline-strong after:mask-(--star) after:mask-contain after:mask-center after:mask-no-repeat";

/** A star on the rule above, centred between the rails (for two-column frames). */
export const STAR =
  "pointer-events-none absolute -top-2 left-[calc(50%-7.5px)] z-2 size-[15px] bg-hairline-strong mask-(--star) mask-contain mask-center mask-no-repeat";

/** Breathing room between sections. */
export const GAP = "h-[clamp(3rem,7vw,6.5rem)]";

export const H2 =
  "text-[clamp(2.125rem,4vw,3.25rem)]/[1.08] font-medium tracking-[-0.022em] text-balance";

export const MONO_LABEL = "font-mono text-xs/4 tracking-normal text-ink/40";

export const BRACKETS =
  "font-mono text-xs/4 tracking-normal whitespace-pre text-ink/24";

/** Large two-tone copy: the lead in `<strong>`, the rest muted. */
export const FEATURE_TEXT =
  "text-[clamp(1.125rem,1.6vw,1.25rem)]/[1.4] tracking-[-0.012em] text-pretty text-ink/56 [&_strong]:font-medium [&_strong]:text-ink";

/** Rendered markdown lists: square accent bullets, quiet underlined links. */
export const PROSE = [
  "text-[0.9375rem]/[1.6] text-ink/72",
  "[&_ul]:grid [&_ul]:gap-2",
  "[&_li]:relative [&_li]:pl-4 [&_li]:text-pretty",
  "[&_li]:before:absolute [&_li]:before:top-[0.65em] [&_li]:before:left-0 [&_li]:before:size-1 [&_li]:before:bg-heat [&_li]:before:content-['']",
  "[&_a]:text-ink [&_a]:underline [&_a]:decoration-ink/24 [&_a]:decoration-1 [&_a]:underline-offset-3 [&_a]:transition-[text-decoration-color] [&_a]:duration-150 [&_a:hover]:decoration-current",
].join(" ");

export const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[0.625rem] px-3.5 text-[0.875rem] font-medium whitespace-nowrap transition-[background-color,scale] duration-150 active:scale-[0.985] [&_svg]:size-4 [&_svg]:shrink-0";

export const BTN_HEAT =
  "bg-heat text-on-heat shadow-[inset_0_-6px_12px_rgb(255_255_255/0.16),inset_0_1px_0_rgb(255_255_255/0.24),0_1px_2px_color-mix(in_srgb,var(--heat)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--heat)_90%,#000)]";

export const BTN_SOFT = "bg-ink/4 text-ink hover:bg-ink/6";

/** An accent text link; pair with `HoverArrow` or `DisclosureChevron`. */
export const LINK =
  "inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-heat";

export const CHIP =
  "inline-flex h-6.5 items-center rounded-full border border-hairline px-2.5 text-xs tracking-normal text-ink/72";

/** A full-width list row that tints on hover; put `ROW_ARROW` on its arrow. */
export const ROW_LINK =
  "group/row relative grid border-b border-hairline transition-colors duration-150 hover:bg-ink/4";

/** A softer row for lists inside cards: no rule, a rounded tint on hover. */
export const ROW_SOFT = "rounded-[0.625rem] border-b-0 hover:bg-ink/6";

export const ROW_ARROW =
  "size-3.5 shrink-0 text-ink/40 transition-[color,translate] duration-200 ease-snappy group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:text-heat";
