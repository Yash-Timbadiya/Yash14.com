# @yash14 Registry — Instructions

How the `@yash14` shadcn registry works in this project, and how to maintain it.

- **Namespace:** `@yash14`
- **Domain:** `https://yash14.com`
- **Install URL pattern:** `https://yash14.com/r/{name}.json`
- **Install command (for consumers):** `npx shadcn@latest add @yash14/<name>`

> No approval from shadcn is required. A registry is just static JSON served over
> HTTPS. The `@yash14` namespace is a local alias defined in `components.json` —
> there is no central signup or API key.

---

## How it works

The registry follows the same pipeline as chanhdai.com (the `@ncdai` registry this
project was forked from). The **source of truth** is the `_registry.ts` files, NOT
the generated `registry.json`.

```
src/registry/components/_registry.ts   ← define each item (name, files, deps…)
            │
            ▼
src/registry/index.ts                  ← assembles all items into `registry`
            │
            ▼  bun run ./src/scripts/build-registry.mts
registry.json                          ← generated manifest (do not edit by hand)
src/registry/__index__.tsx             ← generated; used by the site for previews
            │
            ▼  shadcn build
public/r/*.json                        ← generated; the files consumers download
            │
            ▼  deploy to yash14.com
https://yash14.com/r/<name>.json       ← live, installable
```

Run the whole thing with:

```bash
bun run registry:build
```

(`registry:build` = `bun run ./src/scripts/build-registry.mts && shadcn build`.)

Validate the generated manifest:

```bash
bun run registry:validate
```

---

## Key files

| File | Role | Edit by hand? |
|---|---|---|
| `src/registry/components/_registry.ts` | Item definitions (source of truth) | ✅ Yes |
| `src/registry/index.ts` | Assembles items into the `registry` object | ✅ When adding new groups |
| `src/scripts/build-registry.mts` | Build pipeline (writes `registry.json` + `__index__.tsx`) | Rarely |
| `src/config/registry.ts` | Namespace + URL config + category lists | When rebranding |
| `components.json` → `registries` | Maps `@yash14` → install URL | Rarely |
| `registry.json` (root) | Generated manifest | ❌ Generated |
| `src/registry/__index__.tsx` | Generated preview index | ❌ Generated |
| `public/r/*.json` | Generated, served files | ❌ Generated |

---

## Add a new component

1. **Add the source file** under its own folder:

   ```
   src/registry/components/<name>/<name>.tsx
   ```

2. **Register it** in `src/registry/components/_registry.ts`:

   ```ts
   {
     name: "my-component",
     type: "registry:component",
     title: "My Component",
     description: "What it does.",
     dependencies: ["motion"],          // npm deps it needs
     files: [
       {
         path: "components/my-component/my-component.tsx",
         type: "registry:component",
         target: "@components/my-component.tsx",
       },
     ],
     categories: ["effects"],            // see categories in src/config/registry.ts
     docs: "https://yash14.com/components/my-component",
   },
   ```

   - `path` is relative to `src/registry/` — the build script prefixes it automatically.
   - To depend on another item in *this* registry, use `registryDependencies` with
     `getRegistryItemUrl("other-item")` (from `@/utils/registry`), which resolves to
     `https://yash14.com/r/other-item.json`.

3. **Rebuild:**

   ```bash
   bun run registry:build
   ```

   This regenerates `registry.json`, `__index__.tsx`, and `public/r/my-component.json`.

4. **(Optional) Document it** for the site: add an `.mdx` file in
   `src/features/doc/content/` (see `icon-swap.mdx` as a template). Only `.mdx`
   files are picked up by `getAllDocs()`.

---

## Adding other item types (hooks, styles)

Currently only `components` exists. To add a group:

1. Create `src/registry/<group>/_registry.ts` exporting an array (e.g. `hooks`).
2. Import and spread it in `src/registry/index.ts`:

   ```ts
   import { hooks } from "./hooks/_registry"
   // …
   items: [...components, ...hooks],
   ```

3. Rebuild.

---

## Going live

The registry only works once the site is deployed to **yash14.com** — until then the
`https://yash14.com/r/...` URLs will 404.

- **Local testing:** run `next dev` and the files are served at
  `http://localhost:3000/r/<name>.json`. You can test installs against a local URL.
- **Production:** deploy the portfolio to `yash14.com`. Then anyone can run
  `npx shadcn@latest add @yash14/<name>` (after they add `@yash14` to their own
  `components.json` registries, or by using the full URL).

---

## TODO

- [ ] Replace the placeholder author `yash14 <hello@yash14.com>` in
      `src/scripts/build-registry.mts` with real name/email.
- [ ] Deploy to `yash14.com`.
