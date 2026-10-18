"use client";

import type { BookmarkListEntry } from "../types";

import { trackEvent } from "@/lib/analytics";
import { BookmarkList } from "./bookmark-list";
import { Button } from "@/components/ui/button";
import { useBookmarkFilters } from "../lib/search-params";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const MIN_ROWS = 5;

export function BookmarkListFiltered({
  entries,
}: {
  entries: BookmarkListEntry[];
}) {
  const [filters, setFilters] = useBookmarkFilters();

  const filteredEntries = entries.filter(
    (entry) => !filters.category || entry.category === filters.category,
  );

  if (filteredEntries.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 p-4">
        <p className="font-mono text-sm">No bookmarks match this filter.</p>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            trackEvent(ANALYTICS_EVENTS.BOOKMARK_FILTER_CLEARED, {
              section: ANALYTICS_SECTIONS.BOOKMARKS_PAGE,
              source: ANALYTICS_SOURCES.EMPTY_STATE,
              from: filters.category,
            });
            setFilters(null);
          }}
        >
          Clear filter
        </Button>
      </div>
    );
  }

  return <BookmarkList entries={filteredEntries} minRows={MIN_ROWS} />;
}
