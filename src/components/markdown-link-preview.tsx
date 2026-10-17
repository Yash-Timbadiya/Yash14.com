"use client";

import type { Components } from "react-markdown";
import type { AnalyticsProperties } from "@/lib/analytics";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { LinkPreview } from "@/components/link-preview";
import rehypeExternalLinks from "rehype-external-links";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { rehypeAddQueryParams } from "@/lib/rehype-add-query-params";

function createMarkdownComponents(
  eventProperties?: AnalyticsProperties,
): Components {
  return {
    a: ({ href, children, className, rel, target }) => {
      if (!href) {
        return <span>{children}</span>;
      }

      return (
        <LinkPreview
          url={href}
          className={cn("link-underline", className)}
          rel={typeof rel === "string" ? rel : undefined}
          target={typeof target === "string" ? target : undefined}
          side="top"
          onClick={
            eventProperties
              ? () =>
                  trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
                    ...eventProperties,
                    url: href,
                  })
              : undefined
          }
        >
          {children}
        </LinkPreview>
      );
    },
  };
}

export function MarkdownLinkPreview({
  children,
  eventProperties,
}: {
  children: string;
  /** Sent with `description_link_click` when a link in the text is clicked. */
  eventProperties?: AnalyticsProperties;
}) {
  const markdownComponents = useMemo(
    () => createMarkdownComponents(eventProperties),
    [eventProperties],
  );

  return (
    <Markdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeExternalLinks, { target: "_blank", rel: "nofollow noopener" }],
        [rehypeAddQueryParams, UTM_PARAMS],
      ]}
    >
      {children}
    </Markdown>
  );
}
