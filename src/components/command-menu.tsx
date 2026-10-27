"use client";

import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent, AnalyticsSection } from "@/lib/analytics-events";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { copyText } from "@/utils/copy";
import { Kbd, KbdGroup } from "./ui/kbd";
import { CopyButton } from "./copy-button";
import { BRAND_ASSETS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { getMarkSVG, YTMark } from "./yt-mark";
import { getWordmarkSVG } from "./yt-wordmark";
import { useRouter } from "@bprogress/next/app";
import { useHotkeys } from "react-hotkeys-hook";
import { useTiks } from "@rexa-developer/tiks/react";
import { USER } from "@/features/portfolio/data/user";
import { EmailIcon, PhoneIcon, SearchIcon } from "./icons";
import { useClickSound } from "@/hooks/soundcn/use-click-sound";
import React, { useCallback, useEffect, useState } from "react";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { SOCIAL_ICONS } from "@/features/portfolio/components/social-link-icons";
import {
  decodeEmail,
  decodePhoneNumber,
  formatPhoneNumber,
} from "@/utils/string";
import {
  SOCIAL_LINKS,
  SOCIAL_REDIRECT_EVENTS,
} from "@/features/portfolio/data/social-links";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_METHODS,
  ANALYTICS_SECTIONS,
} from "@/lib/analytics-events";
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
  FlameIcon,
  LineChartIcon,
  MonitorIcon,
  MoonStarIcon,
  PaletteIcon,
  SquareDashedIcon,
  SunMediumIcon,
  TextInitialIcon,
  TypeIcon,
} from "lucide-react";

type CommandKind = "command" | "page" | "link";

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
  /** Sent when the item is selected, with `section: "command_menu"` added. */
  event?: AnalyticsEvent;
  eventProperties?: Omit<AnalyticsProperties, "section">;
  /** Sent when the item's copy button copies `copyText`. */
  copyEvent?: AnalyticsEvent;
};

const MENU_LINKS: CommandLinkItem[] = [
  {
    title: "Home",
    href: "/",
    kind: "page",
    icon: <YTMark />,
    shortcut: "GH",
    event: ANALYTICS_EVENTS.VIEW_HOME,
  },
  {
    title: "Brand",
    href: "/brand-guidelines",
    kind: "page",
    icon: <SquareDashedIcon />,
    shortcut: "GY",
    event: ANALYTICS_EVENTS.VIEW_BRAND_GUIDELINES,
  },
  {
    title: "Bookmarks",
    href: "/bookmarks",
    kind: "page",
    icon: <BookmarkIcon />,
    shortcut: "GB",
    keywords: ["links", "resources", "reading"],
    event: ANALYTICS_EVENTS.VIEW_BOOKMARKS,
  },
  {
    title: "Roast My Site",
    href: "/roast",
    kind: "page",
    icon: <FlameIcon />,
    shortcut: "GR",
    keywords: ["roast", "audit", "website", "seo", "lighthouse", "review"],
    event: ANALYTICS_EVENTS.VIEW_ROAST,
  },
];

const PORTFOLIO_LINKS: CommandLinkItem[] = [
  {
    title: "Hello",
    href: "/#hello",
    kind: "page",
    event: ANALYTICS_EVENTS.VIEW_SECTION,
    eventProperties: { target: "hello" },
    icon: <TextInitialIcon />,
  },
  {
    title: "Experience",
    href: "/#experience",
    kind: "page",
    event: ANALYTICS_EVENTS.VIEW_SECTION,
    eventProperties: { target: "experience" },
    icon: <BriefcaseBusinessIcon />,
  },
  {
    title: "Projects",
    href: "/#projects",
    kind: "page",
    event: ANALYTICS_EVENTS.VIEW_SECTION,
    eventProperties: { target: "projects" },
    icon: <BoxIcon />,
  },
  {
    title: "Bookmarks",
    href: "/#bookmarks",
    kind: "page",
    event: ANALYTICS_EVENTS.VIEW_SECTION,
    eventProperties: { target: "bookmarks" },
    icon: <BookmarkIcon />,
  },
  {
    title: "Insights",
    href: "/#insights",
    kind: "page",
    event: ANALYTICS_EVENTS.VIEW_SECTION,
    eventProperties: { target: "insights" },
    icon: <LineChartIcon />,
  },
  {
    title: "Creative Portfolio",
    href: "https://creative.yash14.com/",
    kind: "link",
    icon: <PaletteIcon />,
    keywords: ["creative", "portfolio", "design", "old portfolio"],
    openInNewTab: true,
    event: ANALYTICS_EVENTS.REDIRECT_TO_CREATIVE_PORTFOLIO,
    eventProperties: { url: "https://creative.yash14.com/" },
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
    event: ANALYTICS_EVENTS.EMAIL_CLICK,
    copyEvent: ANALYTICS_EVENTS.EMAIL_COPY,
  },
  {
    title: formatPhoneNumber(CONTACT_PHONE),
    href: `tel:${CONTACT_PHONE}`,
    kind: "link",
    icon: <PhoneIcon />,
    keywords: ["phone", "contact", "number", "call"],
    copyText: CONTACT_PHONE,
    event: ANALYTICS_EVENTS.PHONE_NUMBER_CLICK,
    copyEvent: ANALYTICS_EVENTS.PHONE_NUMBER_COPY,
  },
];

const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map((item) => ({
  title: item.title,
  href: item.href,
  kind: "link",
  icon: SOCIAL_ICONS[item.name],
  openInNewTab: true,
  event: SOCIAL_REDIRECT_EVENTS[item.name],
  eventProperties: { url: item.href },
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
    event: ANALYTICS_EVENTS.DOWNLOAD_VCARD,
  },
  {
    title: "llms.txt",
    href: "/llms.txt",
    kind: "link",
    icon: <FileTextIcon />,
    openInNewTab: true,
    event: ANALYTICS_EVENTS.VIEW_LLMS_TXT,
  },
];

export function CommandMenu({
  enabledHotkeys = false,
  section,
}: {
  enabledHotkeys?: boolean;
  /** Where this instance of the menu is rendered, sent with its events. */
  section: AnalyticsSection;
}) {
  const router = useRouter();

  const { resolvedTheme, setTheme } = useTheme();

  const [open, setOpenState] = useState(false);

  const setOpen = useCallback(
    (
      next: boolean | ((current: boolean) => boolean),
      method: "keyboard" | "click" | "dismiss" | "action",
    ) => {
      setOpenState((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        if (current !== resolved) {
          trackEvent(
            resolved
              ? ANALYTICS_EVENTS.COMMAND_MENU_OPENED
              : ANALYTICS_EVENTS.COMMAND_MENU_CLOSED,
            {
              method,
              section,
            },
          );
        }
        return resolved;
      });
    },
    [section],
  );

  const [selectedCommandKind, setSelectedCommandKind] =
    useState<CommandKind | null>(null);

  const [click] = useClickSound();

  const { success: tiksSuccess } = useTiks();

  useHotkeys(
    "mod+k, slash",
    (e) => {
      e.preventDefault();

      trackEvent(ANALYTICS_EVENTS.SHORTCUT_USED, {
        section: ANALYTICS_SECTIONS.KEYBOARD,
        shortcut: e.key === "/" ? "/" : "mod+k",
        action: "toggle_command_menu",
      });
      setOpen((current) => !current, "keyboard");
    },
    { enabled: enabledHotkeys },
  );

  const handleOpenLink = useCallback(
    ({ href, openInNewTab, event, eventProperties }: CommandLinkItem) => {
      if (event) {
        trackEvent(event, {
          ...eventProperties,
          section: ANALYTICS_SECTIONS.COMMAND_MENU,
        });
      }
      setOpen(false, "action");

      if (openInNewTab) {
        window.open(href, "_blank", "noopener");
      } else if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    },
    [router, setOpen],
  );

  const handleCopyText = useCallback(
    (text: string, message: string, event: AnalyticsEvent) => {
      trackEvent(event, { section: ANALYTICS_SECTIONS.COMMAND_MENU });
      setOpen(false, "action");
      copyText(text);
      toast.success(message);
      tiksSuccess();
    },
    [tiksSuccess, setOpen],
  );

  const createThemeHandler = useCallback(
    (theme: "light" | "dark" | "system") => () => {
      click();
      trackEvent(ANALYTICS_EVENTS.THEME_CHANGED, {
        from: resolvedTheme ?? null,
        to: theme,
        method: "command_menu",
        section: ANALYTICS_SECTIONS.COMMAND_MENU,
      });
      setOpen(false, "action");

      setTheme(theme);
    },
    [click, resolvedTheme, setTheme, setOpen],
  );

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
          setOpen(true, "click");
        }}
      />

      <CommandDialog
        open={open}
        onOpenChange={(next) => setOpen(next, "dismiss")}
      >
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
                    handleCopyText(
                      getMarkSVG(),
                      "Mark as SVG copied",
                      ANALYTICS_EVENTS.COPY_MARK_SVG,
                    );
                  }}
                >
                  <YTMark />
                  Copy Mark as SVG
                </CommandMenuItem>

                <CommandMenuItem
                  onHighlight={handleCommandHighlight}
                  onSelect={() => {
                    handleCopyText(
                      getWordmarkSVG(),
                      "Logotype as SVG copied",
                      ANALYTICS_EVENTS.COPY_LOGOTYPE_SVG,
                    );
                  }}
                >
                  <TypeIcon />
                  Copy Logotype as SVG
                </CommandMenuItem>

                <CommandMenuItem
                  onHighlight={handleCommandHighlight}
                  onSelect={() => {
                    trackEvent(ANALYTICS_EVENTS.DOWNLOAD_BRAND_ASSETS, {
                      section: ANALYTICS_SECTIONS.COMMAND_MENU,
                      url: BRAND_ASSETS.url,
                    });
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
  onLinkSelect: (link: CommandLinkItem) => void;
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
            onSelect={() => onLinkSelect(link)}
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
                aria-label={`Copy ${link.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onCopySuccess={() => {
                  if (link.copyEvent) {
                    trackEvent(link.copyEvent, {
                      section: ANALYTICS_SECTIONS.COMMAND_MENU,
                      method: ANALYTICS_METHODS.BUTTON,
                    });
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
