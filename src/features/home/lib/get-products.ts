import type { LinkedItem } from "./parse-description";

import { EXPERIENCES } from "@/features/portfolio/data/experiences";
import { parseDescription, parseLinkedItems } from "./parse-description";

/** Every product listed under a role, in the order of the experience data. */
export function getProducts(): LinkedItem[] {
  return EXPERIENCES.flatMap((experience) =>
    experience.positions.flatMap((position) =>
      parseDescription(position.description ?? "").flatMap(
        (section) => parseLinkedItems(section.items) ?? [],
      ),
    ),
  );
}
