import type { TechStackBrandIcon } from "../types/tech-stack";

import { cdn } from "@/utils/cdn";

// Logos sourced from https://svgl.app, with Simple Icons and official site icons where svgl has none.
// Served from R2 (cdn/tech-stack-icons/), uploaded with `pnpm cdn:upload`.
function icon(name: string, options?: { dark?: boolean; ext?: "svg" | "png" }) {
  const ext = options?.ext ?? "svg";
  return {
    light: cdn(`/tech-stack-icons/${name}.${ext}`),
    dark: options?.dark
      ? cdn(`/tech-stack-icons/${name}-dark.${ext}`)
      : undefined,
  } satisfies TechStackBrandIcon;
}

export const TECH_STACK_BRAND_ICONS: Record<string, TechStackBrandIcon> = {
  typescript: icon("typescript"),
  js: icon("js"),
  python: icon("python"),

  react: icon("react", { dark: true }),
  nextjs: icon("nextjs", { dark: true }),
  tailwindcss: icon("tailwindcss"),
  "shadcn-ui": icon("shadcn-ui", { dark: true }),
  radixui: icon("radixui", { dark: true }),
  "base-ui": icon("base-ui", { dark: true }),
  motion: icon("motion", { dark: true }),
  expo: icon("expo", { dark: true }),
  tanstack: icon("tanstack", { dark: true }),
  zustand: icon("zustand", { ext: "png" }),

  nodejs: icon("nodejs"),
  bun: icon("bun"),
  postgresql: icon("postgresql"),
  mongodb: icon("mongodb", { dark: true }),
  redis: icon("redis"),
  nginx: icon("nginx"),
  trpc: icon("trpc"),
  zod: icon("zod"),
  "drizzle-orm": icon("drizzle-orm", { dark: true }),
  prisma: icon("prisma", { dark: true }),
  neon: icon("neon"),
  planetscale: icon("planetscale", { dark: true }),
  supabase: icon("supabase"),

  stripe: icon("stripe"),
  square: icon("square", { dark: true }),
  "dodo-payments": icon("dodo-payments"),
  razorpay: icon("razorpay", { ext: "png" }),
  "authorize-net": icon("authorize-net", { ext: "png" }),
  twilio: icon("twilio"),
  "retell-ai": icon("retell-ai", { dark: true, ext: "png" }),
  telnyx: icon("telnyx", { ext: "png" }),
  gohighlevel: icon("gohighlevel", { ext: "png" }),
  klaviyo: icon("klaviyo", { ext: "png" }),

  vercel: icon("vercel", { dark: true }),
  "google-cloud": icon("google-cloud"),
  aws: icon("aws", { dark: true }),
  cloudflare: icon("cloudflare"),
  railway: icon("railway", { dark: true }),

  claude: icon("claude"),
  cursor: icon("cursor", { dark: true }),
  gemini: icon("gemini"),
  chatgpt: icon("chatgpt", { dark: true }),
  git: icon("git"),
  github: icon("github", { dark: true }),
  docker: icon("docker"),

  posthog: icon("posthog", { dark: true }),
  betterstack: icon("betterstack", { dark: true }),
  sentry: icon("sentry", { dark: true }),
  "microsoft-clarity": icon("microsoft-clarity", { ext: "png" }),
  "meta-pixel": icon("meta-pixel"),

  figma: icon("figma"),
  paper: icon("paper"),
  ps: icon("ps"),
};
