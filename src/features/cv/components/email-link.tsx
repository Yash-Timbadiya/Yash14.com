"use client";

import { useEffect, useState } from "react";
import { decodeEmail } from "@/utils/string";
import { PROFILE } from "@/features/cv/data/cv";

/** Builds the mailto only in the browser so the address is never in the served HTML. */
export function EmailLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState("#contact");

  useEffect(() => {
    setHref(`mailto:${decodeEmail(PROFILE.emailB64)}`);
  }, []);

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
