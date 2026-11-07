import { cn } from "@/lib/utils";
import { AsciiField } from "./ascii-field";
import { BAND, FRAME, GAP, H2, MONO_LABEL } from "@/features/home/lib/styles";

/** Total numbered sections, shown in each index row. */
const SECTION_COUNT = 5;

/** The empty band and index row that open every section. */
export function SectionIndex({
  index,
  label,
}: {
  index: number;
  label: string;
}) {
  return (
    <>
      <div className={BAND}>
        <div className={cn(FRAME, GAP)} />
      </div>
      <div className={BAND}>
        <div
          className={cn(
            FRAME,
            "grid h-16 items-stretch lg:h-22 lg:grid-cols-2",
          )}
        >
          {/* A steady accent tick on the left rail. */}
          <span
            className="absolute top-1/2 -left-px h-6 w-0.5 -translate-y-1/2 bg-heat"
            aria-hidden
          />
          <div
            className={cn(
              MONO_LABEL,
              "flex items-center gap-3 px-6 uppercase lg:px-10",
            )}
          >
            <span className="text-ink/24">
              [{" "}
              <span className="text-heat">
                {String(index).padStart(2, "0")}
              </span>{" "}
              / {String(SECTION_COUNT).padStart(2, "0")} ]
            </span>
            <span className="text-ink/24">·</span>
            <span>{label}</span>
          </div>
          <div className="border-l border-line max-lg:hidden" />
        </div>
      </div>
    </>
  );
}

/** The centered heading block, with ASCII art drifting behind it. */
export function SectionHead({
  icon,
  label,
  title,
  description,
  seed,
  as: Heading = "h2",
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: React.ReactNode;
  description: React.ReactNode;
  seed: number;
  /** `h1` when the block heads a page rather than a section. */
  as?: "h1" | "h2";
  /** Extra content under the description, such as actions. */
  children?: React.ReactNode;
}) {
  return (
    <div className={BAND}>
      <div className={FRAME}>
        <div className="relative overflow-hidden">
          <AsciiField
            variant="islands"
            seed={seed}
            className="absolute inset-0 size-full text-ink/24 mask-[radial-gradient(ellipse_at_center,transparent_34%,black_72%)]"
          />
          <div className="relative flex flex-col items-center px-6 py-16 text-center lg:py-24">
            <Eyebrow icon={icon} label={label} />
            <Heading className={cn(H2, "mt-4")}>{title}</Heading>
            <p className="mt-4 max-w-xl text-base/6 text-pretty text-ink/72">
              {description}
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** `// icon Label \\` over a rule that fades out at both ends. */
export function Eyebrow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="relative inline-flex items-center gap-2.5 px-3.5 pt-1 pb-2.5 text-[0.75rem] font-medium after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(to_right,transparent,var(--hairline-strong)_20%,var(--hairline-strong)_80%,transparent)] [&_svg]:size-4.5 [&_svg]:text-heat">
      <span className="font-mono tracking-[-0.05em] text-ink/24" aria-hidden>
        {"//"}
      </span>
      {icon}
      <span>{label}</span>
      <span className="font-mono tracking-[-0.05em] text-ink/24" aria-hidden>
        {"\\\\"}
      </span>
    </div>
  );
}
