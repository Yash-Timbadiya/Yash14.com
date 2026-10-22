import type { Experience } from "@/features/portfolio/types/experiences";

import { cdn } from "@/utils/cdn";
import { BriefcaseBusinessIcon, CodeXmlIcon } from "lucide-react";

export const EXPERIENCES: Experience[] = [
  {
    id: "cross-even",
    companyName: "Cross Even",
    companyLogo: cdn("/logo/crosseven.png"),
    companyWebsite: "https://crosseven.com",
    largeLogo: true,
    invertLogoInLight: true,
    location: "United States",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Full Stack Developer",
        employmentPeriod: {
          start: "05.2025",
        },
        employmentType: "Full-time",
        icon: <CodeXmlIcon />,
        description: `- Build and scale robust Next.js 16 platforms that facilitate online medical evaluations for tens of thousands of patients across the U.S.
- Build a secure Electronic Health Records (EHR) portal where physicians review evaluations, manage patient records, and issue documentation.
- Engineer high-traffic patient portals with multi-step intake, scheduling, and document delivery flows.
- Build and maintain marketing sites optimized for SEO, performance, and conversion.
- Implement state-specific compliance rules and complex medical workflows across products.
- Automate clinical documentation using Puppeteer and pdf-lib.
- Leverage Vertex AI and the Vercel AI SDK to integrate intelligent, AI-driven features into healthcare delivery.
- Maintain scalable features with TypeScript, PostgreSQL (Drizzle ORM), and tRPC, deployed on Google Cloud.
- Manage asynchronous background tasks with BullMQ and Redis.
- Lead rigorous bug resolution efforts for seamless production performance.
- Integrate Stripe and Square for billing, and Twilio and Retell AI for real-time patient-physician communication.

Products I've built and maintain:
- [Wellness Wag](https://wellnesswag.com) — Online ESA and PSD letters from licensed therapists.
- [ParkingMD](https://parkingmd.com) — Online medical evaluations for disabled parking permits.
- [Minimal](https://joinminimal.com) — Doctor-guided weight loss and telehealth treatment programs.
- [LeafyRX](https://leafyrx.org) — Online medical marijuana card evaluations.
- [Emma & Buddy](https://emmaandbuddy.com) — ESA letters for college and housing.
- [FMLADocs](https://fmladocs.com) — FMLA paperwork approved in 24 hours or less.
- [TintedMD](https://tintedmd.com) — Medical window tint exemptions for vehicles.`,
        skills: [
          "Next.js",
          "TypeScript",
          "tRPC",
          "Zod",
          "Zustand",
          "Tailwind CSS",
          "PostgreSQL",
          "Drizzle ORM",
          "BullMQ",
          "Redis",
          "NGINX",
          "Google Cloud",
          "Vertex AI",
          "Vercel AI SDK",
          "Stripe",
          "Twilio",
          "Retell AI",
          "Telnyx",
          "GoHighLevel",
          "Klaviyo",
        ],
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "enacton",
    companyName: "EnactOn Technologies",
    companyLogo: cdn("/logo/enacton.png"),
    companyWebsite: "https://www.enacton.com",
    location: "Gujarat, India",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Full Stack Developer",
        employmentPeriod: {
          start: "01.2025",
        },
        employmentType: "Full-time",
        icon: <CodeXmlIcon />,
        description: `- Build scalable web applications for U.S.-based clients, delivering high-performance solutions tailored to the North American market.
- Handle end-to-end development, from architecting responsive frontends to optimizing backend services, meeting rigorous standards for reliability and user experience.
- Leverage the MERN stack alongside TypeScript and Next.js to develop feature-rich applications and internal tools.
- Streamline deployment pipelines and enhance application performance through efficient database management and API integration.

Products I've built and maintain:
- [Proposal.biz](https://proposal.biz) — Online proposal creation and document collaboration platform.
- [Coupomated](https://coupomated.com) — Coupon and deals data feed API for affiliate marketers.
- [EnactSoft](https://enactsoft.com) — Cashback, coupon, and affiliate marketing software solutions.
- [Sparissimo](https://sparissimo.world) — Platform with ClickandFood, Wallet, Community, Academy, API Business, and Cashback modules.`,
        skills: [
          "MongoDB",
          "Express.js",
          "React",
          "Node.js",
          "TypeScript",
          "Next.js",
        ],
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "freelance",
    companyName: "Freelance",
    companyIcon: <BriefcaseBusinessIcon strokeWidth={1.8} />,
    positions: [
      {
        id: "1",
        title: "Full-stack Developer",
        employmentPeriod: {
          start: "2024",
          end: "06.2026",
        },
        employmentType: "Part-time",
        description: `- Built custom business sites for [Infinity Infotech](https://infinityinfotech.tech) — surveillance, solar, and smart wiring solutions.
- Designed and built the [MEI Solar](https://meisolar.in) marketing site for a utility-scale solar farm developer with sun-tracking panel technology.
- Developed custom e-commerce sites and Shopify stores for small businesses.`,
        icon: <CodeXmlIcon />,
        skills: [
          "Bun",
          "Next.js",
          "TypeScript",
          "Shopify",
          "Framer",
          "Motion",
          "Tailwind CSS",
          "PostgreSQL",
          "Prisma ORM",
          "Drizzle ORM",
          "Stripe",
          "NGINX",
          "Docker",
          "AWS",
          "Supabase",
          "Google Cloud",
        ],
      },
    ],
  },
];
