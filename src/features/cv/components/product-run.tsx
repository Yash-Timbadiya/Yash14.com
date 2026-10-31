"use client";

import type { Product } from "@/features/cv/data/cv";

import { useId, useState } from "react";
import { withUtm } from "@/features/cv/data/cv";
import { ChevronDownIcon } from "./illustrations";

/** Every shipped product as one running paragraph, faded until expanded. */
export function ProductRun({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="run" data-open={open}>
      <p className="run-text" id={id}>
        {products.map((product, i) => (
          <a
            key={product.name}
            className="run-item"
            href={withUtm(product.href)}
            target="_blank"
            rel="noopener"
          >
            <span className="run-badge" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            {product.name}.{product.note && ` ${product.note}`}{" "}
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
