"use client";

import { useId } from "react";
import { toast } from "sonner";
import { copyText } from "@/utils/copy";
import { MailIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { decodeEmail } from "@/utils/string";
import { useHotkeys } from "react-hotkeys-hook";
import { useIsClient } from "@/hooks/use-is-client";
import { useTiks } from "@rexa-developer/tiks/react";
import { CopyButton } from "@/components/copy-button";
import { RevealEncodedTextScript } from "./reveal-encoded-text";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item";

type EmailItemProps = {
  emailB64: string;
};

export function EmailItem({ emailB64 }: EmailItemProps) {
  const id = useId();
  const isClient = useIsClient();
  const emailDecoded = decodeEmail(emailB64);

  const { success } = useTiks();

  useHotkeys("shift+e", () => {
    trackEvent("keyboard_shortcut_used", {
      shortcut: "shift+e",
      action: "copy_email",
    });
    copyText(emailDecoded, "email");
    success();
    toast.success("Email copied");
  });

  return (
    <IntroItem className="group">
      <IntroItemIcon>
        <MailIcon />
      </IntroItemIcon>

      <IntroItemContent className="flex">
        <IntroItemLink
          id={id}
          href={isClient ? `mailto:${emailDecoded}` : ""}
          suppressHydrationWarning
        >
          {isClient ? emailDecoded : ""}
        </IntroItemLink>
      </IntroItemContent>

      <div className="-translate-x-3 translate-y-0.5 opacity-0 transition-opacity ease-out group-hover:opacity-100">
        <CopyButton
          className="rounded-md border-none text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
          variant="ghost"
          size="icon-xs"
          text={() => emailDecoded}
          aria-label="Copy email"
          trackAs="email"
        />
      </div>

      <RevealEncodedTextScript id={id} textB64={emailB64} />
    </IntroItem>
  );
}
