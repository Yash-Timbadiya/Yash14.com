// Thanks @fumadocs

"use client";

import type { CopyState } from "@/hooks/use-copy-to-clipboard";
import type { AnalyticsEvent, AnalyticsSection } from "@/lib/analytics-events";

import { trackEvent } from "@/lib/analytics";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useRef, useState } from "react";
import { useTiks } from "@rexa-developer/tiks/react";
import { CopyStateIcon } from "@/components/copy-button";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClaudeIcon,
  CursorIcon,
  GitHubIcon,
  GrokIcon,
  MarkdownIcon,
  OpenAIIcon,
  SciraIcon,
} from "@/components/icons";

const cache = new Map<string, string>();

export function LLMCopyButton({
  markdownUrl,
  section,
}: {
  markdownUrl: string;
  section: AnalyticsSection;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const [isCopying, setIsCopying] = useState(false);
  const operationRef = useRef(false);

  const { success, error } = useTiks();

  const handleCopy = async () => {
    if (operationRef.current) return;

    operationRef.current = true;

    const loadingTimer = setTimeout(() => {
      setIsCopying(true);
    }, 150);

    try {
      const cached = cache.get(markdownUrl);
      if (cached) {
        await navigator.clipboard.writeText(cached);
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": fetch(markdownUrl)
              .then((res) => res.text())
              .then((content) => {
                cache.set(markdownUrl, content);
                return content;
              }),
          }),
        ]);
      }
      trackEvent(ANALYTICS_EVENTS.COPY_PAGE, { section, url: markdownUrl });
      success();
      setState("done");
    } catch {
      error();
      setState("error");
    } finally {
      clearTimeout(loadingTimer);
      setIsCopying(false);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      operationRef.current = false;
      setState("idle");
    }
  };

  return (
    <Button
      className="h-7 gap-1.5 border-none px-2 text-[0.8125rem] active:scale-none"
      variant="secondary"
      size="sm"
      aria-busy={isCopying}
      disabled={isCopying}
      onClick={handleCopy}
    >
      <CopyStateIcon
        state={state}
        idleIcon={<IconCopy />}
        doneIcon={<IconCheck />}
        errorIcon={<IconX />}
      />
      <span className="max-[28rem]:hidden">Copy Page</span>
    </Button>
  );
}

function getPrompt(url: string) {
  return `Read ${url}, I want to ask questions about it.`;
}

export function ViewOptions({
  markdownUrl,
  githubUrl,
  section,
}: {
  markdownUrl: string;
  githubUrl?: string;
  section: AnalyticsSection;
}) {
  const items = useMemo(() => {
    const fullMarkdownUrl =
      typeof window !== "undefined"
        ? new URL(markdownUrl, window.location.origin).toString()
        : markdownUrl;

    const q = getPrompt(fullMarkdownUrl);

    const _items: {
      title: string;
      href: string;
      icon: React.ComponentType;
      event: AnalyticsEvent;
    }[] = [
      {
        title: "View as Markdown",
        href: fullMarkdownUrl,
        icon: MarkdownIcon,
        event: ANALYTICS_EVENTS.VIEW_PAGE_MARKDOWN,
      },
      ...(githubUrl
        ? [
            {
              title: "Open in GitHub",
              href: githubUrl,
              icon: GitHubIcon,
              event: ANALYTICS_EVENTS.REDIRECT_TO_GITHUB,
            },
          ]
        : []),
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: OpenAIIcon,
        event: ANALYTICS_EVENTS.OPEN_IN_CHATGPT,
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({
          q,
        })}`,
        icon: ClaudeIcon,
        event: ANALYTICS_EVENTS.OPEN_IN_CLAUDE,
      },
      {
        title: "Open in Cursor",
        href: `https://cursor.com/link/prompt?${new URLSearchParams({
          text: q,
        })}`,
        icon: CursorIcon,
        event: ANALYTICS_EVENTS.OPEN_IN_CURSOR,
      },
      {
        title: "Open in Grok",
        href: `https://grok.com/?${new URLSearchParams({
          q,
        })}`,
        icon: GrokIcon,
        event: ANALYTICS_EVENTS.OPEN_IN_GROK,
      },
      {
        title: "Open in Scira AI",
        href: `https://scira.ai/?${new URLSearchParams({
          q,
        })}`,
        icon: SciraIcon,
        event: ANALYTICS_EVENTS.OPEN_IN_SCIRA,
      },
    ];

    return _items;
  }, [markdownUrl, githubUrl]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          trackEvent(ANALYTICS_EVENTS.PAGE_OPTIONS_OPENED, { section });
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          className="size-7 border-none active:scale-none"
          variant="secondary"
          size="icon-sm"
          aria-label="View Options"
        >
          <ChevronDownIcon className="mt-0.5 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-fit"
        align="start"
        alignOffset={-6}
        collisionPadding={16}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {items.map(({ title, href, icon: Icon, event }) => (
          <DropdownMenuItem key={href} asChild>
            <a
              href={href}
              rel="noopener"
              target="_blank"
              onClick={() => trackEvent(event, { section, url: markdownUrl })}
            >
              <Icon />
              {title}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LLMCopyButtonWithViewOptions({
  markdownUrl,
  githubUrl,
  section,
}: {
  markdownUrl: string;
  githubUrl?: string;
  section: AnalyticsSection;
}) {
  return (
    <ButtonGroup>
      <LLMCopyButton markdownUrl={markdownUrl} section={section} />
      <ButtonGroupSeparator className="border-y-4 border-secondary dark:bg-white/20 data-vertical:my-0" />
      <ViewOptions
        markdownUrl={markdownUrl}
        githubUrl={githubUrl}
        section={section}
      />
    </ButtonGroup>
  );
}
