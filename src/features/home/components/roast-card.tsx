"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedFlameIcon } from "@/features/roast/components/animated-flame-icon";

const EXAMPLES = [
  "competitor-i-dont-like.com",
  "my-side-project.dev",
  "that-startup-landing-page.io",
];

const TYPE_MS = 55;
const HOLD_MS = 1800;

/** Types a few example sites into the placeholder, one character at a time. */
function useTypedPlaceholder(enabled: boolean) {
  const [text, setText] = useState(EXAMPLES[0]);

  useEffect(() => {
    if (
      !enabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let example = 0;
    let length = 0;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      const current = EXAMPLES[example];
      length++;
      setText(current.slice(0, length));

      if (length < current.length) {
        timer = setTimeout(type, TYPE_MS);
      } else {
        example = (example + 1) % EXAMPLES.length;
        length = 0;
        timer = setTimeout(type, HOLD_MS);
      }
    };

    timer = setTimeout(type, HOLD_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  return text;
}

export function RoastCard() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const placeholder = useTypedPlaceholder(value.length === 0);

  return (
    <form
      className="home-roast"
      onSubmit={(event) => {
        event.preventDefault();
        const url = value.trim();
        if (url) router.push(`/roast?url=${encodeURIComponent(url)}`);
      }}
    >
      <input
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`Roast ${placeholder}`}
        aria-label="Website to roast"
      />
      <div className="flex items-center justify-between gap-3 p-2.5 pl-4">
        <span className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
          <AnimatedFlameIcon className="size-4.5 shrink-0 text-(color:--heat)" />
          Roast My Site
        </span>
        <button
          type="submit"
          className="home-btn home-btn-heat h-9! rounded-lg! px-3.5!"
        >
          Roast
        </button>
      </div>
    </form>
  );
}
