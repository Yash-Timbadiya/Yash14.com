import type { BookmarkListEntry } from "../types";

export function BookmarkList({
  entries,
  minRows = 0,
}: {
  entries: BookmarkListEntry[];
  /** Pads short lists with blank rows so filtering does not collapse the page. */
  minRows?: number;
}) {
  const fillerCount = Math.max(0, minRows - entries.length);
  const filler = entries.at(-1);

  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.url} className="border-b border-line last:border-none">
          {entry.card}
        </li>
      ))}

      {/* Invisible copies of a real card keep each blank row exactly one row tall. */}
      {filler &&
        Array.from({ length: fillerCount }, (_, index) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: static filler rows
            key={index}
            className="invisible"
            aria-hidden
            inert
          >
            {filler.card}
          </li>
        ))}
    </ul>
  );
}
