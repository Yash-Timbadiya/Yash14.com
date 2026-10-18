import type { BookmarkCategoryParam } from "./lib/search-params";

export enum BookmarkCategory {
  /** Blog posts, technical articles, and opinion pieces. */
  ARTICLE = "Article",
  /** Educational platforms, video courses, and interactive learning sites. */
  COURSE = "Course",
  /** Published books, e-books, and long-form reading. */
  BOOK = "Book",
  /** Guidelines, handbooks, design principles, and philosophy docs. */
  REFERENCE = "Reference",
  /** UI and component libraries, blocks, and design kits. */
  UI_LIBRARY = "UI Library",
  /** Tools and utilities that aid development or design. */
  SOFTWARE = "Software",
}

export type Bookmark = {
  title: string;
  /** Canonical link; also the entry's identity for list keys and click analytics. */
  url: string;
  author?: string;
  icon?: React.ReactElement;
  category: BookmarkCategory;
  bookmarkedAt: string;
  /** 1-2 first-person sentences shown on cards. */
  why?: string;
};

export const BOOKMARK_CATEGORY_TO_PARAM: Record<
  BookmarkCategory,
  BookmarkCategoryParam
> = {
  [BookmarkCategory.ARTICLE]: "article",
  [BookmarkCategory.COURSE]: "course",
  [BookmarkCategory.BOOK]: "book",
  [BookmarkCategory.REFERENCE]: "reference",
  [BookmarkCategory.UI_LIBRARY]: "ui-library",
  [BookmarkCategory.SOFTWARE]: "software",
};

/**
 * `card` is a server-rendered slot: `Bookmark.icon` is server JSX, so a
 * bookmark cannot cross the client boundary as data, and rendering on the
 * server keeps the card out of the client bundle.
 */
export type BookmarkListEntry = {
  url: string;
  category: BookmarkCategoryParam;
  card: React.ReactNode;
};
