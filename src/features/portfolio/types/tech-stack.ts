/** Paths under `public/` to the original brand logo; `dark` is only set when the light logo is unreadable on dark backgrounds. */
export type TechStackBrandIcon = {
  light: string;
  dark?: string;
};

export type TechStack = {
  key: string;
  title: string;
  href: string;
  icon: React.ReactElement;
  categories: string[];
};
