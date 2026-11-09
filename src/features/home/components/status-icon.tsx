/**
 * A half dial while a role is ongoing, a check once it has ended. Both use the
 * company's accent (`--tab-accent`, falling back to the site accent) and share
 * one 14px grid so they line up at the same size.
 */
export function StatusIcon({ ongoing }: { ongoing: boolean }) {
  return (
    <svg
      className="size-4 shrink-0 text-(--tab-accent,var(--heat))"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      {ongoing ? (
        <>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="7" cy="7" r="6.75" fill="currentColor" />
          <path
            d="M4.4 7.2 6.2 9l3.4-3.5"
            stroke="var(--paper)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
