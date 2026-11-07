import { IconCircleCheckFilled } from "@tabler/icons-react";

/** A half dial while a role is ongoing, a check once it has ended. */
export function StatusIcon({ ongoing }: { ongoing: boolean }) {
  if (!ongoing) {
    return (
      <IconCircleCheckFilled
        className="size-4 text-(color:--ink-40)"
        aria-hidden
      />
    );
  }

  return (
    <svg
      className="size-4 text-(color:--heat)"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
    </svg>
  );
}
