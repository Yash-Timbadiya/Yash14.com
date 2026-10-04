import type { User } from "@/features/portfolio/types/user";

import { cdn } from "@/utils/cdn";

export const USER: User = {
  firstName: "Yash",
  lastName: "Timbadiya",
  displayName: "Yash Timbadiya",
  username: "yash14",
  gender: "male",
  pronouns: "he/him",
  bio: "Creating with code. Small details matter.",
  flipSentences: [
    "Creating with code. Small details matter.",
    "Full Stack Developer",
    "Open Source Contributor",
  ],
  address: "Surat, India",
  // base64 encoded
  phoneNumberB64: "KzkxODc5OTQ0MjEwMQ==", // +91 87994 42101
  emailB64: "aGVsbG9AeWFzaDE0LmNvbQ==", // hello@yash14.com
  website: "https://yash14.com",
  jobTitle: "Full Stack Developer",
  jobs: [
    {
      title: "Full Stack Developer",
      company: "EnactOn",
      website: "https://www.enacton.com/?atp=yash14",
      experienceId: "EnactOn",
    },
  ],
  about: `
- I'm Yash Timbadiya (call me Yash) — a Full Stack Developer with 2+ years of experience, known for pixel-perfect execution and an obsessive attention to detail.
- Focused on transforming complex ideas into seamless, production-ready digital solutions. I deliver polished, thoughtfully crafted projects that prioritize clean code, performance, and user experience.
- Creator of [yash14.com](https://github.com/Yash-Timbadiya/Yash14.com)
`,
  avatar: cdn("/assets/yash.webp"),
  ogImage: cdn("/screenshots/screenshot-og-image-dark.png"),
  namePronunciationUrl: cdn("/audio/yashtimbadiya.mp3"),
  timeZone: "Asia/Kolkata",
  keywords: [
    "Full Stack Developer",
    "Open Source Contributor",
    "Yash",
    "Yash_1434",
    "Yash Timbadiya",
    "Yash Timbadiya Portfolio",
    "Yash Timbadiya Projects",
    "Yash Timbadiya Skills",
    "Yash Timbadiya Experience",
    "Yash Timbadiya Education",
    "Yash Timbadiya Contact",
    "Yash Timbadiya About",
  ],
  dateCreated: "2026-6-11", // YYYY-MM-DD
};
