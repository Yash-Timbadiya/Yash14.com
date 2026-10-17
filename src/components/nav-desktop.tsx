"use client";

import type { Route } from "next";
import type { NavItem } from "@/types/nav";

import { Nav } from "@/components/nav";
import { usePathname } from "next/navigation";
import { trackNavItemClick } from "@/lib/analytics";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function NavDesktop({ items }: { items: NavItem<Route>[] }) {
  const pathname = usePathname();

  return (
    <Nav
      className="max-sm:hidden"
      items={items}
      activeId={pathname}
      onItemClick={(href) => trackNavItemClick(href, ANALYTICS_SECTIONS.HEADER)}
    />
  );
}
