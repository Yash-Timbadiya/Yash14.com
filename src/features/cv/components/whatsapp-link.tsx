"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/utils/whatsapp";

/** Builds the wa.me link only in the browser so the number is never in the served HTML. */
export function WhatsAppLink({
  message,
  className,
  tabIndex,
  children,
}: {
  message: string;
  className?: string;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState("#contact");

  useEffect(() => {
    setHref(whatsappHref(message));
  }, [message]);

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener"
      tabIndex={tabIndex}
    >
      {children}
    </a>
  );
}
