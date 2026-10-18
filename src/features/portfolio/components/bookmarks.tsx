import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelTitleCopy } from "./panel-title-copy";
import { BOOKMARKS } from "@/features/bookmark/data";
import { TrackedLink } from "@/components/tracked-link";
import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "./panel";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import { BookmarkItem } from "@/features/bookmark/components/bookmark-item";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const ID = "bookmarks";
const PREVIEW_COUNT = 5;

export function Bookmarks() {
  const latest = sortBookmarksNewestFirst(BOOKMARKS).slice(0, PREVIEW_COUNT);

  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <TrackedLink
            href={`#${ID}`}
            event={ANALYTICS_EVENTS.VIEW_SECTION}
            eventProperties={{
              section: ANALYTICS_SECTIONS.BOOKMARKS,
              source: ANALYTICS_SOURCES.HEADING,
              target: ID,
            }}
          >
            Bookmarks
          </TrackedLink>
          <PanelTitleSup>({BOOKMARKS.length})</PanelTitleSup>
          <PanelTitleCopy id={ID} section={ANALYTICS_SECTIONS.BOOKMARKS} />
        </PanelTitle>
      </PanelHeader>

      <ul>
        {latest.map((bookmark) => (
          <li key={bookmark.url} className="border-b border-line">
            <BookmarkItem
              bookmark={bookmark}
              section={ANALYTICS_SECTIONS.BOOKMARKS}
            />
          </li>
        ))}
      </ul>

      <div className="flex justify-center py-4">
        <Button
          className="gap-2 pr-2.5 pl-3 shadow-[inset_0_0_1px] shadow-foreground/20"
          variant="secondary"
          size="sm"
          asChild
        >
          <TrackedLink
            href="/bookmarks"
            event={ANALYTICS_EVENTS.VIEW_BOOKMARKS}
            eventProperties={{
              section: ANALYTICS_SECTIONS.BOOKMARKS,
              source: ANALYTICS_SOURCES.VIEW_ALL,
            }}
          >
            All bookmarks
            <ArrowRightIcon />
          </TrackedLink>
        </Button>
      </div>
    </Panel>
  );
}
