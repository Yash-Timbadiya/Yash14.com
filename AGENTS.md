# AI Agent Guidelines for yash14.com

Next.js 16 (App Router) portfolio website.

**Stack**: TypeScript, Tailwind CSS v4, shadcn/ui, MDX, pnpm, Vercel

## Project Structure

| Directory                              | Purpose                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `src/app/`                             | App Router pages, layouts, API routes                       |
| `src/components/`                      | Shared UI components                                        |
| `src/features/`                        | Feature modules: `doc` (page layout), `portfolio`           |
| `src/config/`                          | Site (`site.ts`) and JSON-LD (`json-ld.ts`) configuration   |
| `src/hooks/`, `src/lib/`, `src/utils/` | Hooks, libraries, utilities                                 |

**Key files**: `components.json` (shadcn config), `src/features/portfolio/data/` (portfolio data), `.env.example` (env vars)

## Coding Guidelines

- TypeScript strict mode; explicit types when necessary
- kebab-case file naming
- Descriptive names; comments only for "why", not "what"
- No emojis in code, comments, or commit messages
- Tailwind CSS v4 syntax; support dark/light modes
- Follow SOLID principles

## Commands

```bash
pnpm dev             # Dev server
pnpm build           # Production build
pnpm lint            # ESLint
pnpm format:write    # Prettier
pnpm check-types     # Type checking
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
