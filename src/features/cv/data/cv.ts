import type { Experience } from "@/features/portfolio/types/experiences";

import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { USER } from "@/features/portfolio/data/user";
import { EDUCATION } from "@/features/portfolio/data/education";
import { SOCIAL } from "@/features/portfolio/data/social-links";
import { EXPERIENCES } from "@/features/portfolio/data/experiences";

/**
 * The resume at cv.yash14.com. Facts (roles, dates, products, schools, links)
 * come from the portfolio data so both sites stay in sync; only the copy
 * written for this page lives here.
 */

export const CV_URL = "https://cv.yash14.com";

export const withUtm = (href: string) => addQueryParams(href, UTM_PARAMS);

export const PROFILE = {
  name: USER.displayName,
  role: USER.jobTitle,
  location: USER.address,
  emailB64: USER.emailB64,
  website: USER.website,
  github: SOCIAL.github.href,
  linkedin: SOCIAL.linkedin.href,
  x: SOCIAL.x.href,
};

export const NAV = [
  { label: "Hello", href: "#hello" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "FAQ", href: "#faq" },
];

type Illustration = "pulse" | "tag" | "window";

/** Copy written for the resume, keyed by experience id. */
const ROLE_COPY: Record<
  string,
  { summary: string; illustration: Illustration }
> = {
  "cross-even": {
    summary:
      "Telehealth platforms that handle online medical evaluations for tens of thousands of patients across the U.S.",
    illustration: "pulse",
  },
  enacton: {
    summary:
      "Web applications for clients across the USA and Europe, working directly with US and Germany-based teams on requirements, updates and timelines.",
    illustration: "tag",
  },
  freelance: {
    summary:
      "Started as V&B Technologies, offering affordable software and web hosting to small businesses across different sectors.",
    illustration: "window",
  },
};

export type Role = {
  id: string;
  company: string;
  href?: string;
  title: string;
  period: string;
  meta: string;
  summary: string;
  /** Markdown, may contain inline links. */
  highlights: string[];
  stack: string[];
  illustration: Illustration;
};

const year = (value: string) => value.split(".").at(-1) ?? value;

/** "05.2025" → 2025 * 12 + 4, "2024" → 2024 * 12. */
export const toMonthIndex = (value: string) => {
  const [a, b] = value.split(".");
  return b ? Number(b) * 12 + Number(a) - 1 : Number(a) * 12;
};

const PRODUCTS_HEADING = /^products i've built/i;
const BULLET = /^-\s+/;
const LIST_LINK = /^-\s+\[([^\]]+)\]\(([^)]+)\)\s+-\s+(.+)$/;
const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.+))?/;

function toRole(experience: Experience): Role {
  const position = experience.positions[0];
  const { start, end } = position.employmentPeriod;
  const copy = ROLE_COPY[experience.id];
  const lines = (position.description ?? "").split("\n").map((l) => l.trim());
  const productsAt = lines.findIndex((l) => PRODUCTS_HEADING.test(l));
  const bulletLines = productsAt === -1 ? lines : lines.slice(0, productsAt);

  return {
    id: experience.id,
    company: experience.companyName,
    href: experience.companyWebsite,
    title: position.title,
    period: `${year(start)} - ${end ? year(end) : "Now"}`,
    meta: [
      experience.location,
      experience.locationType ?? position.employmentType,
    ]
      .filter(Boolean)
      .join(" · "),
    summary: copy?.summary ?? "",
    highlights: bulletLines
      .filter((l) => BULLET.test(l))
      .map((l) => l.replace(BULLET, "")),
    stack: position.skills ?? [],
    illustration: copy?.illustration ?? "window",
  };
}

export const ROLES: Role[] = EXPERIENCES.map(toRole);

export type Product = {
  name: string;
  href: string;
  note?: string;
};

/** Short descriptions for products whose experience line doesn't have one. */
const PRODUCT_NOTES: Record<string, string> = {
  "MEI Solar": "Let's Track The Sun",
};

/** Every product linked from an experience description, in the order listed. */
export const PRODUCTS: Product[] = EXPERIENCES.flatMap((experience) =>
  (experience.positions[0].description ?? "").split("\n").flatMap((line) => {
    const listed = line.trim().match(LIST_LINK);
    if (listed) {
      return [{ name: listed[1], href: listed[2], note: listed[3] }];
    }
    const inline = line.match(INLINE_LINK);
    if (inline) {
      const note = inline[3]?.replace(/^./, (c) => c.toUpperCase());
      return [{ name: inline[1], href: inline[2], note }];
    }
    return [];
  }),
).map((product) => ({
  ...product,
  note: PRODUCT_NOTES[product.name] ?? product.note,
}));

/** Timeline milestones, derived from the same dates as the portfolio. */
export const CAREER_EVENTS = (() => {
  const degree = EDUCATION.find((e) => e.id === "ppsu");
  const events = [
    degree && { label: "B.Tech begins", start: degree.period.start },
    ...[...EXPERIENCES].reverse().map((e) => ({
      label:
        e.id === "freelance"
          ? "First clients"
          : e.companyName.replace(/ Technologies$/, ""),
      start: e.positions[0].employmentPeriod.start,
    })),
  ].filter((e): e is { label: string; start: string } => Boolean(e));

  return events.map((e) => {
    const [m, y] = e.start.includes(".") ? e.start.split(".") : ["01", e.start];
    const date = new Date(Number(y), Number(m) - 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    return { label: e.label, date, month: toMonthIndex(e.start) };
  });
})();

export type Project = {
  id: string;
  name: string;
  label: string;
  href?: string;
  description: string;
  illustration: "nodes" | "chat" | "photos" | "desktop";
};

export const PROJECTS: Project[] = [
  {
    id: "plura",
    name: "Plura",
    label: "Plura",
    href: "https://github.com/Yash-Timbadiya/Plura",
    description:
      "Multi-vendor B2B2B SaaS with a website builder, Kanban boards, team access and Stripe Connect fees on every sale.",
    illustration: "nodes",
  },
  {
    id: "community",
    name: "Community",
    label: "Community",
    href: "https://github.com/Yash-Timbadiya/Community",
    description:
      "Channels, private one-on-one chats, and audio and video calls for diverse communities.",
    illustration: "chat",
  },
  {
    id: "memories",
    name: "Memories",
    label: "Memories",
    description:
      "MERN social network with email verification, threaded comments and friend connections.",
    illustration: "photos",
  },
  {
    id: "macos",
    name: "macOS on the web",
    label: "macOS Web",
    href: "https://creative.yash14.com",
    description:
      "A virtual simulation of macOS in React, TypeScript and UnoCSS, deployed on Vercel.",
    illustration: "desktop",
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "PHP", "Java", "C++"],
  },
  {
    group: "Frontend",
    items: ["Next.js", "React", "Tailwind CSS", "GSAP", "Motion", "Figma"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Express", "tRPC", "Prisma", "Drizzle", "BullMQ"],
  },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { group: "Cloud", items: ["AWS", "Google Cloud", "Vercel", "Docker", "Bun"] },
];

export const STACK_WORDMARKS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
];

/** Details the portfolio doesn't carry, keyed by education id. */
const EDUCATION_NOTES: Record<string, string> = {
  ppsu: "CGPA 7.91 / 10",
  "ashadeep-higher-secondary": "IIT-JEE preparation",
};

export const EDUCATION_ITEMS = EDUCATION.map((item) => ({
  id: item.id,
  title: [item.degree, item.fieldOfStudy].filter(Boolean).join(", "),
  school: item.school,
  detail: [
    `${year(item.period.start)} - ${item.period.end ? year(item.period.end) : "Now"}`,
    EDUCATION_NOTES[item.id],
  ]
    .filter(Boolean)
    .join(" · "),
}));

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Are you open to new work?",
    a: "Yes. I'm open to full-time roles and selected freelance projects where product quality and the small details matter.",
  },
  {
    q: "Do you work with international teams?",
    a: "Every day. I work directly with clients in the United States and Germany, and I'm comfortable overlapping with US and European hours.",
  },
  {
    q: "What does your usual stack look like?",
    a: "Next.js and React with TypeScript on the front, Node.js with tRPC or Express on the back, and PostgreSQL through Drizzle or Prisma. Redis and BullMQ for background work.",
  },
  {
    q: "Can I see your code?",
    a: "Most client work is private, but Plura, Community and my portfolio are open source on GitHub.",
  },
  {
    q: "What do you do away from the keyboard?",
    a: "Chess, cricket, travelling and trekking, photo and video editing, and the occasional video game.",
  },
  {
    q: "Can I get a PDF copy?",
    a: "Yes. Use your browser's print dialog and choose Save as PDF; the page has a print layout built in.",
  },
];
