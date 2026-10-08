import type React from "react";
import type { Route } from "next";
import type { NavItem } from "@/types/nav";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Nav({
  items,
  activeId,
  className,
  exactMatch = false,
}: {
  items: NavItem<Route>[];
  activeId?: string;
  className?: string;
  exactMatch?: boolean;
}) {
  return (
    <nav
      data-active-id={activeId}
      className={cn("flex items-center gap-4", className)}
    >
      {items.map(({ title, href }) => {
        const isActive = exactMatch
          ? activeId === href
          : activeId === href ||
            (href === "/" // Home page
              ? ["/", "/index"].includes(activeId || "")
              : activeId?.startsWith(href));

        return (
          <NavLink
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
          >
            {title}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function NavLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-sm font-medium tracking-wide text-muted-foreground transition-[color] hover:text-foreground aria-[current=page]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
