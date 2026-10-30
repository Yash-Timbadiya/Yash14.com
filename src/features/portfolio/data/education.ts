import type { Education } from "@/features/portfolio/types/education";

export const EDUCATION: Education[] = [
  {
    id: "ppsu",
    school: "P P Savani University",
    degree: "Bachelor of Technology (B.Tech)",
    fieldOfStudy: "Information Technology",
    period: {
      start: "09.2021",
      end: "04.2025",
    },
    description: `- Completed a Bachelor of Technology in Information Technology at [P P Savani University](https://www.ppsu.ac.in/).
- Developed strong foundations in data structures, databases, object-oriented programming, web development, and software engineering.
- Turned academic learning into production experience by starting professional full-stack development work before graduation.

Selected projects:
- [Plura](https://github.com/Yash-Timbadiya/Plura) — Built a multi-tenant SaaS platform with a drag-and-drop website and funnel builder, agency and sub-account management, Stripe subscriptions and Connect payments, dashboards, and a Kanban project board.
- [Community](https://github.com/Yash-Timbadiya/Community) — Built a real-time community platform with customizable channels, direct messaging, file attachments, audio and video calls, roles, invitations, and responsive light and dark interfaces.

Achievements:
- Built and shipped custom business websites and e-commerce experiences while completing the degree.
- Created [creative.yash14.com](https://creative.yash14.com), an open-source mac os inspired developer portfolio.
- Progressed from independent projects and freelance work into full-time full-stack development.`,
    skills: [
      "C++",
      "Java",
      "JavaScript",
      "DSA",
      "OOP",
      "DBMS",
      "Next.js",
      "PostgreSQL",
    ],
  },
  {
    id: "ashadeep-higher-secondary",
    school: "Ashadeep Higher Secondary School",
    degree: "Higher Secondary Education (Grades 11–12)",
    fieldOfStudy: "Science — IIT-JEE Preparation",
    period: {
      start: "06.2019",
      end: "04.2021",
    },
    description: `- Completed Grades 11 and 12 in the Science stream with IIT-JEE preparation through [Ashadeep Foundation](https://iit.ashadeep.co.in/).
- Built a strong foundation in calculus, algebra, coordinate geometry, mechanics, electricity and magnetism, and physical, organic, and inorganic chemistry.
- Developed analytical reasoning, quantitative aptitude, and time-bound problem-solving skills through competitive-exam preparation.`,
    skills: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "IIT-JEE Preparation",
      "Analytical Reasoning",
      "Problem Solving",
      "Quantitative Aptitude",
      "Scientific Thinking",
    ],
  },
];
