import type { Metadata } from "next";

import { Ruler } from "@/features/cv/components/ruler";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollToTop } from "@/components/scroll-to-top";
import { StackLogo } from "@/features/cv/components/stack-logos";
import { CareerLine } from "@/features/cv/components/career-line";
import { ProductRun } from "@/features/cv/components/product-run";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";
import { InlineMarkdown } from "@/features/cv/components/inline-markdown";
import {
  ArrowRightIcon,
  ExternalIcon,
  Illustration,
  PlusIcon,
} from "@/features/cv/components/illustrations";
import {
  CV_URL,
  EDUCATION_ITEMS,
  FAQ,
  NAV,
  PRODUCTS,
  PROFILE,
  PROJECTS,
  ROLES,
  SKILLS,
  PROMISES,
  STACK_WORDMARKS,
  WHATSAPP_MESSAGES,
  withUtm,
} from "@/features/cv/data/cv";

const TITLE = `${PROFILE.name} - Resume`;
const DESCRIPTION = `${PROFILE.name} is a ${PROFILE.role} in ${PROFILE.location}, building production Next.js, React, Node.js and PostgreSQL apps for clients in the US and Europe.`;

// The career timeline marks the current month; rebuilding daily keeps it moving.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // Served at cv.yash14.com; the /cv path on the main domain redirects there.
  alternates: { canonical: CV_URL },
  openGraph: {
    type: "profile",
    title: TITLE,
    description: DESCRIPTION,
    url: CV_URL,
  },
};

const CROSS_EVEN = ROLES.find((role) => role.id === "cross-even");
const ENACTON = ROLES.find((role) => role.id === "enacton");

/** Highlights shown per role before "Show more". */
const VISIBLE_HIGHLIGHTS = 3;

// One long ruler tick per entry, top to bottom; "top" is the header.
const SECTION_IDS = [
  "top",
  "hello",
  "experience",
  "projects",
  "skills",
  "education",
  "contact",
  "faq",
];

export default function CvPage() {
  return (
    <>
      <Ruler sectionIds={SECTION_IDS} />

      <main className="sheet" id="top">
        <div className="column">
          <header className="masthead">
            <a className="logo" href="#top">
              <span className="sr-only">{PROFILE.name}, back to top</span>
            </a>
            <nav className="nav" aria-label="Sections">
              {NAV.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <WhatsAppLink message={WHATSAPP_MESSAGES.contact}>
                Contact
              </WhatsAppLink>
            </nav>
            <div className="masthead-actions" data-print="hide">
              <ThemeToggle />
            </div>
          </header>

          <section className="hero">
            <p className="lead">
              Have you ever noticed that the best software feels obvious? Or
              that people decide to trust a product long before they read a
              single word?
            </p>
            <div className="lead">
              <h1 className="sr-only">
                {PROFILE.name}, {PROFILE.role}
              </h1>
              <p>
                This page is a short tour of how my journey started, what
                I&rsquo;ve built, and the work I do every day.
              </p>
            </div>
          </section>

          <figure className="media">
            <div className="media-frame">
              <CareerLine />
            </div>
            <figcaption className="caption">
              A short timeline of a long obsession with details
            </figcaption>
          </figure>

          {/* Hello */}
          <section className="section" id="hello" aria-labelledby="hello-title">
            <h2 className="section-title" id="hello-title" data-dot>
              Hello
            </h2>
            <div className="copy">
              <p>
                My name is Yash. I work as a full stack developer at{" "}
                <a
                  className="dim"
                  href={withUtm(CROSS_EVEN?.href ?? PROFILE.website)}
                  target="_blank"
                  rel="noopener"
                >
                  {CROSS_EVEN?.company}
                </a>{" "}
                on telehealth platforms used by tens of thousands of patients.
              </p>
              <p>
                I care about the parts most people skip: micro-interactions,
                smooth transitions, and pixel-perfect details. I learned most of
                what I know by{" "}
                <span className="serif hover:text-">building </span>
                something. You can see more on{" "}
                <a
                  className="dim"
                  href={withUtm(PROFILE.website)}
                  target="_blank"
                  rel="noopener"
                >
                  yash14.com
                  <ExternalIcon />
                </a>{" "}
                and{" "}
                <a
                  className="dim"
                  href={withUtm(PROFILE.github)}
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                  <ExternalIcon />
                </a>
                .
              </p>
            </div>

            <ul className="tiles" aria-label="Core stack">
              {STACK_WORDMARKS.map((name) => (
                <li key={name} className="tile">
                  <StackLogo name={name} />
                </li>
              ))}
            </ul>
            <p className="caption">The stack I ship with every day</p>

            <ProductRun products={PRODUCTS} />
          </section>

          {/* Experience */}
          <section
            className="section"
            id="experience"
            aria-labelledby="experience-title"
          >
            <h2 className="section-title" id="experience-title" data-dot>
              Experience
            </h2>
            <div className="copy">
              <p>
                My work is split across three places{" "}
                {ROLES.map((role, i) => (
                  <span key={role.id}>
                    <a className="dim" href={`#${role.id}`}>
                      {role.company}
                    </a>
                    {i < ROLES.length - 2
                      ? ", "
                      : i === ROLES.length - 2
                        ? ", and "
                        : "."}
                  </span>
                ))}
              </p>
            </div>

            <div className="cards" data-print="hide">
              {ROLES.map((role) => (
                <a key={role.id} className="card" href={`#${role.id}`}>
                  <div className="card-art">
                    <Illustration name={role.illustration} />
                  </div>
                  <div className="card-foot">
                    <span className="mono">{role.company}</span>
                    <span className="mono">{role.period}</span>
                  </div>
                </a>
              ))}
              <WhatsAppLink
                className="card"
                message={WHATSAPP_MESSAGES.nextRole}
              >
                <div className="card-art">
                  <Illustration name="open" />
                </div>
                <div className="card-foot">
                  <span className="mono">Next role</span>
                  <span className="mono">Open</span>
                </div>
              </WhatsAppLink>
            </div>

            {ROLES.map((role) => {
              const shown = role.highlights.slice(0, VISIBLE_HIGHLIGHTS);
              const more = role.highlights.slice(VISIBLE_HIGHLIGHTS);
              return (
                <article key={role.id} className="role" id={role.id}>
                  <header className="role-head">
                    <div>
                      <h3 className="role-name">
                        {role.href ? (
                          <a
                            href={withUtm(role.href)}
                            target="_blank"
                            rel="noopener"
                          >
                            {role.company}
                          </a>
                        ) : (
                          role.company
                        )}
                      </h3>
                      <p className="role-title">{role.title}</p>
                    </div>
                    <p className="role-meta mono">
                      <span>{role.period}</span>
                      <span>{role.meta}</span>
                    </p>
                  </header>
                  <p className="role-summary">{role.summary}</p>
                  <ul className="checks role-checks">
                    {shown.map((item) => (
                      <li key={item}>
                        <InlineMarkdown>{item}</InlineMarkdown>
                      </li>
                    ))}
                  </ul>
                  {more.length > 0 && (
                    <details className="role-more">
                      <summary>
                        <span className="role-more-open">
                          Show {more.length} more
                        </span>
                        <span className="role-more-close">Show less</span>
                        <PlusIcon />
                      </summary>
                      <ul className="checks role-checks">
                        {more.map((item) => (
                          <li key={item}>
                            <InlineMarkdown>{item}</InlineMarkdown>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <ul className="chips">
                    {role.stack.map((item) => (
                      <li key={item} className="mono">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </section>

          {/* Projects */}
          <section
            className="section"
            id="projects"
            aria-labelledby="projects-title"
          >
            <h2 className="section-title" id="projects-title" data-dot>
              Projects
            </h2>
            <div className="copy">
              <p>
                Side projects are where I try things before clients need them:{" "}
                {PROJECTS.map((project, i) => (
                  <span key={project.id}>
                    <span className="dim">{project.name}</span>
                    {i < PROJECTS.length - 2
                      ? ", "
                      : i === PROJECTS.length - 2
                        ? ", and "
                        : "."}
                  </span>
                ))}
              </p>
            </div>

            <div className="cards">
              {PROJECTS.map((project) => {
                const body = (
                  <>
                    <div className="card-art">
                      <Illustration name={project.illustration} />
                    </div>
                    <div className="card-foot">
                      <span className="mono">{project.label}</span>
                      <span className="mono">
                        {project.href ? "Open" : "Private"}
                      </span>
                    </div>
                  </>
                );
                return project.href ? (
                  <a
                    key={project.id}
                    className="card"
                    href={withUtm(project.href)}
                    target="_blank"
                    rel="noopener"
                    title={project.description}
                  >
                    {body}
                  </a>
                ) : (
                  <div
                    key={project.id}
                    className="card"
                    title={project.description}
                  >
                    {body}
                  </div>
                );
              })}
            </div>

            <ul className="checks">
              {PROJECTS.map((project) => (
                <li key={project.id}>
                  {project.name}.
                  <span className="dim"> {project.description}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section
            className="section"
            id="skills"
            aria-labelledby="skills-title"
          >
            <h2 className="section-title" id="skills-title" data-dot>
              Skills
            </h2>
            <dl className="skills">
              {SKILLS.map((skill) => (
                <div key={skill.group} className="skills-row">
                  <dt className="mono">{skill.group}</dt>
                  <dd>
                    <ul className="skills-list">
                      {skill.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Education */}
          <section
            className="section"
            id="education"
            aria-labelledby="education-title"
          >
            <h2 className="section-title" id="education-title" data-dot>
              Education
            </h2>
            <ul className="edu">
              {EDUCATION_ITEMS.map((item) => (
                <li key={item.id} className="edu-item">
                  <div>
                    <p className="edu-school">{item.school}</p>
                    <p className="edu-degree">{item.degree}</p>
                  </div>
                  <p className="edu-meta mono">{item.period}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section
            className="section"
            id="contact"
            aria-labelledby="contact-title"
          >
            <h2 className="section-title" id="contact-title" data-dot>
              Contact
            </h2>
            <div className="copy">
              <p>What you can count on when we work together.</p>
            </div>
            <ol className="promises">
              {PROMISES.map((promise, index) => (
                <li key={promise.title} className="promise">
                  <span className="promise-index mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="promise-title">{promise.title}</p>
                  <p className="promise-text">{promise.text}</p>
                </li>
              ))}
            </ol>

            <WhatsAppLink className="cta" message={WHATSAPP_MESSAGES.contact}>
              <span className="cta-label">Get in touch</span>
              <span className="cta-side">
                <span className="cta-note">Available 2026</span>
                <span className="cta-arrow">
                  <ArrowRightIcon />
                </span>
              </span>
            </WhatsAppLink>
            <p className="cta-caption">
              Based in {PROFILE.location} &middot; Also on{" "}
              <a
                className="dim"
                href={withUtm(PROFILE.linkedin)}
                target="_blank"
                rel="noopener"
              >
                LinkedIn
              </a>{" "}
              and{" "}
              <a
                className="dim"
                href={withUtm(PROFILE.x)}
                target="_blank"
                rel="noopener"
              >
                X
              </a>
            </p>
          </section>

          {/* FAQ */}
          <section className="section" id="faq" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title" data-dot>
              FAQ
            </h2>
            <div className="faq">
              {FAQ.map((item) => (
                <details key={item.q} name="faq">
                  <summary>
                    {item.q}
                    <PlusIcon />
                  </summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <footer className="footer">
            <span className="mono">{PROFILE.name}</span>
            <a className="mono" href={withUtm(PROFILE.website)}>
              yash14.com
            </a>
          </footer>
        </div>
      </main>

      {/* Same soft blur the home page has, tinted to the sheet and the desk. */}
      <div className="bottom-fade" aria-hidden="true">
        <div className="bottom-fade-sheet" />
      </div>
      <ScrollToTop data-print="hide" />
    </>
  );
}
