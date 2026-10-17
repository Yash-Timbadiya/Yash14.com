import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";

// Import sorting only. Everything else (linting, formatting) stays with Biome,
// whose organizeImports assist is disabled so the two do not fight.
export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "public/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          type: "line-length",
          order: "asc",
          fallbackSort: { type: "alphabetical", order: "asc" },
          newlinesBetween: 1,
          groups: ["type-import", "unknown"],
        },
      ],
    },
  },
];
