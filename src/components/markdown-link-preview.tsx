import type { Components } from "react-markdown";
import type { AnalyticsProperties } from "@/lib/analytics";

import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { UTM_PARAMS } from "@/config/site";
import rehypeExternalLinks from "rehype-external-links";
import { MarkdownLink } from "@/components/markdown-link";
import { rehypeAddQueryParams } from "@/lib/rehype-add-query-params";

// A server component: the markdown is parsed at render time on the server, so
// react-markdown and its unified plugins never ship to the browser. Only the
// links hydrate, through the `MarkdownLink` client component.
function createMarkdownComponents(
  eventProperties?: AnalyticsProperties,
): Components {
  return {
    a: ({ href, children, className, rel, target }) => {
      if (!href) {
        return <span>{children}</span>;
      }

      return (
        <MarkdownLink
          href={href}
          className={className}
          rel={typeof rel === "string" ? rel : undefined}
          target={typeof target === "string" ? target : undefined}
          eventProperties={eventProperties}
        >
          {children}
        </MarkdownLink>
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
  return (
    <Markdown
      components={createMarkdownComponents(eventProperties)}
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
