import { withUtm } from "@/features/cv/data/cv";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders the `[text](url)` links in portfolio bullet text; everything else stays plain. */
export function InlineMarkdown({ children }: { children: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const match of children.matchAll(LINK)) {
    const index = match.index ?? 0;
    parts.push(children.slice(last, index));
    parts.push(
      <a
        key={index}
        className="dim"
        href={withUtm(match[2])}
        target="_blank"
        rel="noopener"
      >
        {match[1]}
      </a>,
    );
    last = index + match[0].length;
  }
  parts.push(children.slice(last));

  return <>{parts}</>;
}
