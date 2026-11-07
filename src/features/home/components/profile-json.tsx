"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { USER } from "@/features/portfolio/data/user";
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links";
import {
  decodeEmail,
  decodePhoneNumber,
  formatPhoneNumber,
} from "@/utils/string";

/**
 * The profile as JSON. The email and phone number are decoded only in the
 * browser, so they stay out of the served HTML.
 */
export function ProfileJson() {
  const isClient = useIsClient();
  const job = USER.jobs[0];

  const profile = {
    name: USER.displayName,
    username: USER.username,
    role: job?.title,
    company: job?.company,
    location: USER.address,
    timezone: USER.timeZone,
    email: isClient ? decodeEmail(USER.emailB64) : "...",
    phone: isClient
      ? formatPhoneNumber(decodePhoneNumber(USER.phoneNumberB64))
      : "...",
    website: USER.website,
    pronouns: USER.pronouns,
    links: Object.fromEntries(
      SOCIAL_LINKS.map((item) => [item.name, item.href]),
    ),
  };

  const lines = JSON.stringify(profile, null, 2).split("\n");

  return (
    <code className="block min-w-max">
      {lines.map((line, index) => (
        <span
          className="grid grid-cols-[3rem_1fr] whitespace-pre"
          key={`${index}-${line.trim()}`}
        >
          <span className="pr-5 text-right text-ink/24 select-none" aria-hidden>
            {index + 1}
          </span>
          <JsonLine line={line} />
        </span>
      ))}
    </code>
  );
}

function JsonLine({ line }: { line: string }) {
  const match = /^(\s*)"([^"]+)":\s(.*)$/.exec(line);

  if (!match) {
    return <span className="text-ink/40">{line}</span>;
  }

  const [, indent, key, value] = match;
  const isString = value.startsWith('"');

  return (
    <span>
      {indent}
      <span className="text-ink/40">"</span>
      <span>{key}</span>
      <span className="text-ink/40">": </span>
      <span className={isString ? "text-heat" : "text-ink/40"}>{value}</span>
    </span>
  );
}
