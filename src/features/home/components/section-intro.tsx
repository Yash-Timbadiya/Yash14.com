import { AsciiField } from "./ascii-field";

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
      <div className="home-band">
        <div className="home-frame home-gap" />
      </div>
      <div className="home-band">
        <div className="home-frame grid h-16 items-stretch lg:h-22 lg:grid-cols-2">
          <span className="home-caret" aria-hidden />
          <div className="home-mono-label flex items-center gap-3 px-6 uppercase lg:px-10">
            <span className="text-(color:--ink-24)">
              [{" "}
              <span className="home-heat">
                {String(index).padStart(2, "0")}
              </span>{" "}
              / {String(SECTION_COUNT).padStart(2, "0")} ]
            </span>
            <span className="text-(color:--ink-24)">·</span>
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
}: {
  icon: React.ReactNode;
  label: string;
  title: React.ReactNode;
  description: React.ReactNode;
  seed: number;
}) {
  return (
    <div className="home-band">
      <div className="home-frame">
        <div className="relative overflow-hidden">
          <AsciiField
            variant="islands"
            seed={seed}
            className="absolute inset-0 size-full text-(color:--ink-24) mask-[radial-gradient(ellipse_at_center,transparent_34%,black_72%)]"
          />
          <div className="relative flex flex-col items-center px-6 py-16 text-center lg:py-24">
            <div className="home-eyebrow">
              <span data-slash aria-hidden>
                {"//"}
              </span>
              {icon}
              <span>{label}</span>
              <span data-slash aria-hidden>
                \\
              </span>
            </div>
            <h2 className="home-h2 mt-4">{title}</h2>
            <p className="mt-4 max-w-xl text-base/6 text-pretty text-(color:--ink-72)">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
