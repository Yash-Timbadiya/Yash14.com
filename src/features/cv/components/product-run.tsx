"use client";

import type { Product } from "@/features/cv/data/cv";

import Image from "next/image";
import { cdn } from "@/utils/cdn";
import { withUtm } from "@/features/cv/data/cv";
import { ChevronDownIcon } from "./illustrations";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Grace period after the pointer leaves a product. Moving straight onto the
 * next one keeps the others blurred instead of flashing them sharp.
 */
const LEAVE_DELAY = 120;

/**
 * Replaced favicons get a new file name (`host.v3.png`), because the CDN
 * caches every file as immutable and would keep serving the old one.
 */
const FAVICON_VERSION: Record<string, number> = { "meisolar.in": 3 };

/**
 * Favicons drawn larger inside their circle, for sites whose icon has a lot
 * of empty space or fine detail and looks small at the default 18px.
 */
const ICON_SIZE: Record<string, number> = {
  "meisolar.in": 22,
  "wellnesswag.com": 24,
};

/** Favicons live on the CDN (cdn/favicons/), one per site, named by hostname. */
const favicon = (href: string) => {
  const host = new URL(href).hostname;
  const version = FAVICON_VERSION[host];
  return cdn(`/favicons/${host}${version ? `.v${version}` : ""}.png`);
};

/** Ends a description with a full stop unless it already has one. */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

/**
 * Every shipped product as one running paragraph, all readable by default:
 * the name in full colour, its description lighter.
 * Hovering or focusing a product blurs the rest so it stands alone.
 */
export function ProductRun({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const leaveTimer = useRef(0);
  const id = useId();

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const enter = (i: number) => {
    window.clearTimeout(leaveTimer.current);
    setHovered(i);
  };
  const leave = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovered(null), LEAVE_DELAY);
  };

  return (
    <div className="run" data-open={open}>
      <p
        className="run-text"
        id={id}
        data-focusing={hovered !== null ? "" : undefined}
      >
        {products.map((product, i) => (
          <a
            key={product.name}
            className="run-item"
            data-active={i === hovered ? "" : undefined}
            href={withUtm(product.href)}
            target="_blank"
            rel="noopener"
            onPointerEnter={() => enter(i)}
            onPointerLeave={leave}
            onFocus={() => enter(i)}
            onBlur={leave}
          >
            <span
              className="run-icon"
              style={
                {
                  "--icon-size": `${ICON_SIZE[new URL(product.href).hostname] ?? 18}px`,
                } as React.CSSProperties
              }
            >
              <Image
                src={favicon(product.href)}
                alt=""
                width={24}
                height={24}
              />
            </span>
            {product.name}
            {product.note && (
              <span className="run-note"> {sentence(product.note)}</span>
            )}{" "}
          </a>
        ))}
      </p>
      <div className="run-fade" aria-hidden />
      <button
        type="button"
        className="run-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Show less" : "Show all products"}
        <ChevronDownIcon />
      </button>
    </div>
  );
}
