"use client";

import type { BookmarkCategoryParam } from "../lib/search-params";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  BOOKMARK_CATEGORY_PARAMS,
  useBookmarkFilters,
} from "../lib/search-params";

const CATEGORY_LABELS: Record<BookmarkCategoryParam, string> = {
  article: "Article",
  course: "Course",
  book: "Book",
  reference: "Reference",
  "ui-library": "UI Library",
  software: "Software",
  other: "Other",
};

export function BookmarkFilters({
  categories,
}: {
  /** Categories that have bookmarks; the rest are hidden. */
  categories: BookmarkCategoryParam[];
}) {
  const [filters, setFilters] = useBookmarkFilters();

  const select = (category: BookmarkCategoryParam | null) => {
    if (category === filters.category) return;

    trackEvent(ANALYTICS_EVENTS.BOOKMARK_FILTER_CHANGED, {
      section: ANALYTICS_SECTIONS.BOOKMARKS_PAGE,
      from: filters.category ?? "all",
      to: category ?? "all",
    });
    setFilters({ category });
  };

  return (
    <div className="no-scrollbar overflow-x-auto">
      <fieldset className="flex w-max min-w-0 items-center pr-2 whitespace-nowrap">
        <legend className="sr-only">Filter by category</legend>

        <FilterTab
          active={filters.category === null}
          onClick={() => select(null)}
        >
          All
        </FilterTab>

        {BOOKMARK_CATEGORY_PARAMS.filter((category) =>
          categories.includes(category),
        ).map((category) => (
          <FilterTab
            key={category}
            active={filters.category === category}
            onClick={() => select(category)}
          >
            {CATEGORY_LABELS[category]}
          </FilterTab>
        ))}
      </fieldset>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="border-r border-line p-4 font-mono text-[.8125rem]/4 font-medium tracking-wide text-muted-foreground uppercase transition-[color,background-color] ease-out hover:bg-accent-muted aria-pressed:bg-accent-muted aria-pressed:text-foreground"
    >
      {children}
    </button>
  );
}
