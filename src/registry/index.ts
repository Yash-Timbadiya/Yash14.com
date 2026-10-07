import type { Registry } from "shadcn/schema";

import { components } from "./components/_registry";

export const registry = {
  name: "yash14",
  homepage: "https://yash14.com/components",
  items: [
    ...components,

    // Add more groups here as you grow the registry, e.g.:
    // ...hooks,
    // ...styles,
  ],
} satisfies Registry;
