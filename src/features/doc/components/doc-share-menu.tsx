"use client";

import { toast } from "sonner";
import { copyText } from "@/utils/copy";
import { trackEvent } from "@/lib/events";
import { Button } from "@/components/base/ui/button";
import { LinkedInIcon, XIcon } from "@/components/icons";
import { EllipsisIcon, LinkIcon, ShareIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

export function DocShareMenu({ title, url }: { title: string; url: string }) {
  const absoluteUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? new URL(url, window.location.origin).toString()
      : url;

  const urlEncoded = encodeURIComponent(absoluteUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="size-7 border-none active:scale-none"
            variant="secondary"
            size="icon-sm"
          >
            <ShareIcon />
          </Button>
        }
      />

      <DropdownMenuContent
        className="w-fit"
        align="start"
        alignOffset={-6}
        collisionPadding={16}
        finalFocus={false}
      >
        <DropdownMenuItem
          onClick={async () => {
            if (await copyText(absoluteUrl)) {
              trackEvent({
                name: "share_document_link",
                properties: { channel: "copy_link" },
              });
              toast.success("Link copied");
            }
          }}
        >
          <LinkIcon />
          Copy link
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <a
              href={`https://x.com/intent/tweet?url=${urlEncoded}`}
              onClick={() => {
                trackEvent({
                  name: "share_document_link",
                  properties: { channel: "x" },
                });
              }}
              target="_blank"
              rel="noopener"
            >
              <XIcon />
              Share on X
            </a>
          }
        />

        <DropdownMenuItem
          render={
            <a
              href={`https://www.linkedin.com/sharing/share-offsite?url=${urlEncoded}`}
              onClick={() => {
                trackEvent({
                  name: "share_document_link",
                  properties: { channel: "linkedin" },
                });
              }}
              target="_blank"
              rel="noopener"
            >
              <LinkedInIcon />
              Share on LinkedIn
            </a>
          }
        />

        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem
            closeOnClick={false}
            onClick={() => {
              navigator
                .share({ title, url: absoluteUrl })
                .then(() => {
                  trackEvent({
                    name: "share_document_link",
                    properties: { channel: "native" },
                  });
                })
                .catch(() => {});
            }}
          >
            <EllipsisIcon />
            Other app
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
