export type DescriptionSection = {
  heading: string | null;
  items: string[];
};

export type LinkedItem = {
  name: string;
  url: string;
  description: string;
};

const LINKED_ITEM = /^\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)$/;

/**
 * Splits the markdown descriptions in the portfolio data into sections, so the
 * layout can treat bullets and product lists differently. A block's first line
 * is its heading unless it is already a bullet.
 */
export function parseDescription(description: string): DescriptionSection[] {
  return description.split(/\n\s*\n/).map((block) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const hasHeading = lines.length > 0 && !lines[0].startsWith("- ");

    return {
      heading: hasHeading ? lines[0].replace(/:$/, "") : null,
      items: (hasHeading ? lines.slice(1) : lines).map((line) =>
        line.replace(/^- /, ""),
      ),
    };
  });
}

/** Reads items shaped `[Name](url) - description`; null if any item differs. */
export function parseLinkedItems(items: string[]): LinkedItem[] | null {
  const parsed: LinkedItem[] = [];

  for (const item of items) {
    const match = LINKED_ITEM.exec(item);
    if (!match) return null;
    parsed.push({ name: match[1], url: match[2], description: match[3] });
  }

  return parsed.length > 0 ? parsed : null;
}

/** Turns plain items back into a markdown list for the shared renderer. */
export function toMarkdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}
