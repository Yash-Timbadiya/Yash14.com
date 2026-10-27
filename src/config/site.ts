import type { Route } from "next";
import type { NavItem } from "@/types/nav";

import { config } from "@/config";
import { cdn } from "@/utils/cdn";
import { USER } from "@/features/portfolio/data/user";

export const SITE_INFO = {
  name: USER.displayName,
  url: config.app.url,
  ogImage: USER.ogImage,
  // Longer than the on-page bio so search snippets carry role, location and stack.
  description: `${USER.displayName} is a ${USER.jobTitle} in ${USER.address}, building fast, pixel-perfect web apps with Next.js, React, TypeScript and Node.js.`,
  keywords: USER.keywords,
};

export const LICENSE = {
  name: "MIT License",
  url: "https://github.com/Yash-Timbadiya/Yash14.com/blob/main/LICENSE",
};

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const MAIN_NAV: NavItem<Route>[] = [
  {
    title: "Roast",
    href: "/roast",
  },
  {
    title: "Bookmarks",
    href: "/bookmarks",
  },
  {
    title: "Brand",
    href: "/brand-guidelines",
  },
];

export const MOBILE_NAV: NavItem<Route>[] = [
  {
    title: "Home",
    href: "/",
  },
  ...MAIN_NAV,
];

export const X_HANDLE = "@Yash_1434_";
export const GITHUB_USERNAME = "Yash-Timbadiya";
export const SOURCE_CODE_GITHUB_REPO = "Yash-Timbadiya/Yash14.com";
export const SOURCE_CODE_GITHUB_URL =
  "https://github.com/Yash-Timbadiya/Yash14.com";

export const UTM_PARAMS = {
  utm_source: "yash14.com",
};

export const BRAND_ASSETS = {
  url: cdn("/assets/yash14-brand.zip"),
};
