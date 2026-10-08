"use client";

import type { DocPreview } from "@/features/doc/types/document";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Kbd, KbdGroup } from "./ui/kbd";
import { trackEvent } from "@/lib/events";
import { CopyButton } from "./copy-button";
import { BRAND_ASSETS } from "@/config/site";
import { getMarkSVG, YTMark } from "./yt-mark";
import { getWordmarkSVG } from "./yt-wordmark";
import { useRouter } from "@bprogress/next/app";
import { useHotkeys } from "react-hotkeys-hook";
import { useTiks } from "@rexa-developer/tiks/react";
import { USER } from "@/features/portfolio/data/user";
import { copyToClipboardWithEvent } from "@/utils/copy";
import { EmailIcon, PhoneIcon, SearchIcon } from "./icons";
import { useClickSound } from "@/hooks/soundcn/use-click-sound";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links";
import { ComponentIcon } from "@/features/doc/components/component-icon";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  decodeEmail,
  decodePhoneNumber,
  formatPhoneNumber,
} from "@/utils/string";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  BookmarkIcon,
  BoxIcon,
  BriefcaseBusinessIcon,
  CornerDownLeftIcon,
  DownloadIcon,
  FileTextIcon,
  LineChartIcon,
  MonitorIcon,
  MoonStarIcon,
  PaletteIcon,
  RssIcon,
  SquareDashedIcon,
  SunMediumIcon,
  TextInitialIcon,
  TypeIcon,
} from "lucide-react";

type CommandKind = "command" | "page" | "link" | "component";

type CommandLinkItem = {
  title: string;
  href: string;
  kind: CommandKind;
  icon?: React.ReactElement;
  iconImage?: string;
  shortcut?: string;
  keywords?: string[];
  openInNewTab?: boolean;
  copyText?: string;
  copyEvent?: "copy_email" | "copy_phone_number";
};

const MENU_LINKS: CommandLinkItem[] = [
  {
    title: "Home",
    href: "/",
    kind: "page",
    icon: <YTMark />,
    shortcut: "GH",
  },
  {
    title: "Brand",
    href: "/brand-guidelines",
    kind: "page",
    icon: <SquareDashedIcon />,
    shortcut: "GY",
  },
];

const PORTFOLIO_LINKS: CommandLinkItem[] = [
  {
    title: "Hello",
    href: "/#hello",
    kind: "page",
    icon: <TextInitialIcon />,
  },
  {
    title: "Experience",
    href: "/#experience",
    kind: "page",
    icon: <BriefcaseBusinessIcon />,
  },
  {
    title: "Projects",
    href: "/#projects",
    kind: "page",
    icon: <BoxIcon />,
  },
  {
    title: "Bookmarks",
    href: "/#bookmarks",
    kind: "page",
    icon: <BookmarkIcon />,
  },
  {
    title: "Insights",
    href: "/#insights",
    kind: "page",
    icon: <LineChartIcon />,
  },
  {
    title: "Creative Portfolio",
    href: "https://creative.yash14.com/",
    kind: "link",
    icon: <PaletteIcon />,
    keywords: ["creative", "portfolio", "design", "old portfolio"],
    openInNewTab: true,
  },
];

const CONTACT_EMAIL = decodeEmail(USER.emailB64);
const CONTACT_PHONE = decodePhoneNumber(USER.phoneNumberB64);

const CONTACT_LINKS: CommandLinkItem[] = [
  {
    title: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    kind: "link",
    icon: <EmailIcon />,
    keywords: ["email", "contact", "mail"],
    copyText: CONTACT_EMAIL,
    copyEvent: "copy_email",
  },
  {
    title: formatPhoneNumber(CONTACT_PHONE),
    href: `tel:${CONTACT_PHONE}`,
    kind: "link",
    icon: <PhoneIcon />,
    keywords: ["phone", "contact", "number", "call"],
    copyText: CONTACT_PHONE,
    copyEvent: "copy_phone_number",
  },
];

const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map((item) => ({
  title: item.title,
  href: item.href,
  kind: "link",
  icon: SOCIAL_ICONS[item.name],
  openInNewTab: true,
}));

const COMMAND_MENU_ACTIVE_LAYOUT_ID = "command-menu-active";

const COMMAND_MENU_ACTIVE_SPRING = {
  type: "spring",
  stiffness: 480,
  damping: 38,
} as const;

const OTHER_LINK_ITEMS: CommandLinkItem[] = [
  {
    title: "Download vCard",
    href: "/vcard",
    kind: "command",
    icon: <DownloadIcon />,
  },
  {
    title: "llms.txt",
    href: "/llms.txt",
    kind: "link",
    icon: <FileTextIcon />,
    openInNewTab: true,
  },
  {
    title: "RSS Feed",
    href: "/rss",
    kind: "link",
    icon: <RssIcon />,
    openInNewTab: true,
  },
];

export function CommandMenu({
  docs,
  enabledHotkeys = false,
}: {
  docs: DocPreview[];
  enabledHotkeys?: boolean;
}) {
  const router = useRouter();

  const { setTheme } = useTheme();

  const [open, setOpen] = useState(false);

  const [selectedCommandKind, setSelectedCommandKind] =
    useState<CommandKind | null>(null);

  const [click] = useClickSound();

  const { success: tiksSuccess } = useTiks();

  useHotkeys(
    "mod+k, slash",
    (e) => {
      e.preventDefault();

      setOpen((open) => {
        if (!open) {
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "keyboard",
              key: e.key === "/" ? "/" : e.metaKey ? "cmd+k" : "ctrl+k",
            },
          });
        }
        return !open;
      });
    },
    { enabled: enabledHotkeys },
  );

  const handleOpenLink = useCallback(
    (href: string, openInNewTab = false) => {
      setOpen(false);

      trackEvent({
        name: "command_menu_action",
        properties: {
          action: "navigate",
          href: href,
          open_in_new_tab: openInNewTab,
        },
      });

      if (openInNewTab) {
        window.open(href, "_blank", "noopener");
      } else if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const handleCopyText = useCallback(
    (text: string, message: string) => {
      setOpen(false);
      copyToClipboardWithEvent(text, {
        name: "command_menu_action",
        properties: {
          action: "copy",
          text: text,
        },
      });
      toast.success(message);
      tiksSuccess();
    },
    [tiksSuccess],
  );

  const createThemeHandler = useCallback(
    (theme: "light" | "dark" | "system") => () => {
      click();
      setOpen(false);

      trackEvent({
        name: "command_menu_action",
        properties: {
          action: "change_theme",
          theme: theme,
        },
      });

      setTheme(theme);
    },
    [click, setTheme],
  );

  const components = useMemo(
    () =>
      docs
        .filter((doc) => doc.category === "components")
        .sort((a, b) =>
          a.title.localeCompare(b.title, "en", {
            sensitivity: "base",
          }),
        ),
    [docs],
  );

  const componentsGroup = useMemo(() => {
    if (!components || components.length === 0) {
      return null;
    }

    return (
      <CommandGroup heading="Components">
        {components.map((component) => {
          return (
            <CommandMenuItem
              key={component.slug}
              keywords={["component"]}
              onHighlight={() => {
                setSelectedCommandKind("component");
              }}
              onSelect={() => {
                handleOpenLink(`/components/${component.slug}`);
              }}
            >
              <ComponentIcon slug={component.slug} />
              <p className="line-clamp-1">{component.title}</p>
            </CommandMenuItem>
          );
        })}
      </CommandGroup>
    );
  }, [components, handleOpenLink]);

  const handleLinkHighlight = useCallback((link: CommandLinkItem) => {
    setSelectedCommandKind(link.kind);
  }, []);

  const handleCommandHighlight = useCallback(() => {
    setSelectedCommandKind("command");
  }, []);

  return (
    <>
      <CommandMenuTrigger
        onClick={() => {
          setOpen(true);
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "click",
            },
          });
        }}
      />

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandMenuInput />

        <div className="rounded-xl bg-background ring-1 ring-border">
          <LayoutGroup id="command-menu">
            <CommandList className="min-h-80 supports-timeline-scroll:scroll-fade-effect-y">
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandLinkGroup
                heading="Menu"
                links={MENU_LINKS}
                onLinkHighlight={handleLinkHighlight}
                onLinkSelect={handleOpenLink}
              />

              <CommandLinkGroup
                heading="Contact"
                links={CONTACT_LINKS}
                onLinkHighlight={handleLinkHighlight}
                onLinkSelect={handleOpenLink}
              />

              <CommandLinkGroup
                heading="Portfolio"
                links={PORTFOLIO_LINKS}
                onLinkHighlight={handleLinkHighlight}
                onLinkSelect={handleOpenLink}
              />

              {componentsGroup}

              <CommandLinkGroup
                heading="Social Links"
                links={SOCIAL_LINK_ITEMS}
                onLinkHighlight={handleLinkHighlight}
                onLinkSelect={handleOpenLink}
              />

              <CommandGroup heading="Brand Assets">
                <CommandMenuItem
                  onHighlight={handleCommandHighlight}
                  onSelect={() => {
                    handleCopyText(getMarkSVG(), "Mark as SVG copied");
                  }}
                >
                  <YTMark />
                  Copy Mark as SVG
                </CommandMenuItem>

                <CommandMenuItem
                  onHighlight={handleCommandHighlight}
                  onSelect={() => {
                    handleCopyText(getWordmarkSVG(), "Logotype as SVG copied");
                  }}
                >
                  <TypeIcon />
                  Copy Logotype as SVG
                </CommandMenuItem>

                <CommandMenuItem
                  onHighlight={handleCommandHighlight}
                  onSelect={() => {
                    const anchor = document.createElement("a");
                    anchor.href = BRAND_ASSETS.url;
                    anchor.download = "";
                    anchor.click();
                  }}
                >
                  <DownloadIcon />
                  Download Brand Assets
                </CommandMenuItem>
              </CommandGroup>

              <CommandGroup heading="Theme">
                <CommandMenuItem
                  keywords={["theme"]}
                  onHighlight={handleCommandHighlight}
                  onSelect={createThemeHandler("light")}
                >
                  <SunMediumIcon />
                  Light
                </CommandMenuItem>
                <CommandMenuItem
                  keywords={["theme"]}
                  onHighlight={handleCommandHighlight}
                  onSelect={createThemeHandler("dark")}
                >
                  <MoonStarIcon />
                  Dark
                </CommandMenuItem>
                <CommandMenuItem
                  keywords={["theme"]}
                  onHighlight={handleCommandHighlight}
                  onSelect={createThemeHandler("system")}
                >
                  <MonitorIcon />
                  System
                </CommandMenuItem>
              </CommandGroup>

              <CommandLinkGroup
                heading="Other"
                links={OTHER_LINK_ITEMS}
                onLinkHighlight={handleLinkHighlight}
                onLinkSelect={handleOpenLink}
              />
            </CommandList>
          </LayoutGroup>
        </div>

        <CommandMenuFooter selectedCommandKind={selectedCommandKind} />
      </CommandDialog>
    </>
  );
}

export default CommandMenu;

function CommandMenuTrigger({ ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="command-menu-trigger"
      className="gap-1.5 border-none px-1.5 text-muted-foreground will-change-[scale] select-none"
      variant="ghost"
      size="sm"
      {...props}
    >
      <SearchIcon />

      <span className="font-sans text-sm/4 font-medium sm:sr-only">
        Search…
      </span>

      {/* Tablets rarely have a keyboard, and the header has no room for the
      hint until md. */}
      <KbdGroup className="hidden gap-0.75 md:in-[.os-macos_&]:flex">
        <Kbd className="w-5 min-w-auto">⌘</Kbd>
        <Kbd className="w-5 min-w-auto">K</Kbd>
      </KbdGroup>

      <KbdGroup className="hidden gap-0.75 md:not-[.os-macos_&]:flex">
        <Kbd>Ctrl</Kbd>
        <Kbd className="w-5 min-w-auto">K</Kbd>
      </KbdGroup>
    </Button>
  );
}

function CommandMenuInput() {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (searchValue.length >= 2) {
      const timeoutId = setTimeout(() => {
        trackEvent({
          name: "command_menu_search",
          properties: {
            query: searchValue,
            query_length: searchValue.length,
          },
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);

  return (
    <div className="relative">
      <CommandInput
        placeholder="Type a command or search…"
        value={searchValue}
        onValueChange={setSearchValue}
        className="pr-14"
      />

      <Kbd className="absolute top-1/2 right-5 -translate-y-1/2 max-sm:hidden">
        Esc
      </Kbd>
    </div>
  );
}

function CommandMenuItem({
  children,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void;
  "data-selected"?: string;
  "aria-selected"?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const reduceMotion = useReducedMotion();

  const syncSelected = useCallback(() => {
    const selected = ref.current?.getAttribute("aria-selected") === "true";
    setIsSelected(selected);
    if (selected) {
      onHighlight?.();
    }
  }, [onHighlight]);

  useMutationObserver(ref, (mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected"
      ) {
        syncSelected();
      }
    }
  });

  useEffect(() => {
    syncSelected();
  }, [syncSelected]);

  return (
    <CommandItem ref={ref} {...props}>
      {isSelected ? (
        <motion.span
          layoutId={COMMAND_MENU_ACTIVE_LAYOUT_ID}
          className="absolute inset-0 z-0 rounded-lg bg-primary/5"
          transition={
            reduceMotion ? { duration: 0 } : COMMAND_MENU_ACTIVE_SPRING
          }
        />
      ) : null}

      <div className="relative z-10 flex w-full min-w-0 items-center gap-2">
        {children}
      </div>
    </CommandItem>
  );
}

function CommandLinkGroup({
  heading,
  links,
  fallbackIcon,
  onLinkHighlight,
  onLinkSelect,
}: {
  heading: string;
  links: CommandLinkItem[];
  fallbackIcon?: React.ReactElement;
  onLinkHighlight: (link: CommandLinkItem) => void;
  onLinkSelect: (href: string, openInNewTab?: boolean) => void;
}) {
  return (
    <CommandGroup heading={heading}>
      {links.map((link) => {
        const icon = link?.icon ?? fallbackIcon ?? <React.Fragment />;

        return (
          <CommandMenuItem
            key={link.href}
            keywords={link.keywords}
            onHighlight={() => onLinkHighlight(link)}
            onSelect={() => onLinkSelect(link.href, link.openInNewTab)}
          >
            {link?.iconImage ? (
              <img
                className="size-4 rounded-sm"
                src={link.iconImage}
                alt={link.title}
              />
            ) : (
              icon
            )}

            <p className="line-clamp-1 min-w-0 flex-1">{link.title}</p>

            {link.copyText ? (
              <CopyButton
                className="pointer-events-auto ml-auto size-7 shrink-0 text-muted-foreground hover:text-foreground"
                variant="ghost"
                text={link.copyText}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onCopySuccess={() => {
                  if (link.copyEvent) {
                    trackEvent({ name: link.copyEvent });
                  }
                  toast.success("Copied to clipboard");
                }}
              />
            ) : (
              link.shortcut && (
                <CommandShortcut className="font-mono tracking-[0.2em] max-sm:hidden">
                  {link.shortcut}
                </CommandShortcut>
              )
            )}
          </CommandMenuItem>
        );
      })}
    </CommandGroup>
  );
}

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
  command: "Run Command",
  page: "Go to Page",
  link: "Open Link",
  component: "Go to Component",
};

function CommandMenuFooter({
  selectedCommandKind,
}: {
  selectedCommandKind: CommandKind | null;
}) {
  return (
    <>
      <div className="flex h-10" />

      <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between gap-2 rounded-b-2xl px-4 text-xs font-medium">
        <YTMark className="size-6 text-muted-foreground" />

        <div className="flex items-center gap-2 max-sm:hidden">
          <span>{ENTER_ACTION_LABELS[selectedCommandKind ?? "page"]}</span>
          <Kbd>
            <CornerDownLeftIcon />
          </Kbd>
        </div>
      </div>
    </>
  );
}
