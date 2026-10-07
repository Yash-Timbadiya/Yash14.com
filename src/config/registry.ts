import { config } from "@/config";

export const registryConfig = {
  /**
   * Registry namespace identifier for shadcn CLI
   * @example "@yash14" - Users can install components with: `npx shadcn add @yash14/icon-swap`
   * @see https://ui.shadcn.com/docs/registry/namespace#overview
   */
  namespace: config.registry.namespace,
  /**
   * URL pattern for resolving namespaced components
   * The {name} placeholder will be replaced with the component name
   * @example "https://yash14.com/r/{name}.json" resolves to "https://yash14.com/r/icon-swap.json"
   * This tells shadcn CLI where to fetch component definitions when installing with namespace prefix
   * @see https://ui.shadcn.com/docs/registry/namespace#url-pattern-system
   */
  namespaceUrl: config.registry.namespaceUrl,
};

export const componentCategories = [
  {
    name: "text-effects",
    title: "Text Effects",
    description:
      "Applies complex visual animations, artistic styling, and interactive micro-interactions explicitly to textual content to create focal points.",
  },
  {
    name: "typography",
    title: "Typography",
    description:
      "Handles fundamental text formatting, legibility optimization, inline structural modifications, and string manipulation without heavy visual animations.",
  },
  {
    name: "effects",
    title: "Effects",
    description:
      "Encompasses generalized visual enhancements, micro-interactions, background decorations, and state transitions that elevate high-fidelity aesthetics.",
  },
  {
    name: "controls",
    title: "Controls",
    description:
      "Interactive UI elements designed to capture user input, manipulate system states, and provide physical-feeling mechanical adjustments.",
  },
  {
    name: "menus",
    title: "Menus",
    description:
      "Transient, overlay-based interfaces that present a localized list of commands, contextual actions, or supplementary options upon user interaction.",
  },
  {
    name: "navigation",
    title: "Navigation",
    description:
      "Structural elements dedicated to wayfinding, enabling users to orient themselves and traverse across different views, sections, or documents.",
  },
  {
    name: "marketing",
    title: "Marketing",
    description:
      "Pre-composed UI components optimized for landing pages to surface social proof, build trust, and present promotional content.",
  },
  {
    name: "data-display",
    title: "Data Display",
    description:
      "Components engineered to visually render quantitative metrics, format structured technical information, and present datasets for analytical consumption.",
  },
  {
    name: "utilities",
    title: "Utilities",
    description:
      "Functional helpers and often invisible wrappers that provide underlying system capabilities, sensory user feedback, or abstract business logic.",
  },
];
