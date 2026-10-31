type Name =
  | "pulse"
  | "tag"
  | "window"
  | "nodes"
  | "chat"
  | "photos"
  | "desktop"
  | "open";

const BARCODE_X = Array.from({ length: 9 }, (_, i) => 158 + i * 3);

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Single-weight line drawings with one orange element each, drawn for this page. */
export function Illustration({ name }: { name: Name }) {
  switch (name) {
    case "pulse":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="46" y="14" width="112" height="128" />
            <rect x="54" y="8" width="112" height="128" fill="var(--card)" />
            <path d="M66 70h22l8-22 14 46 10-30 6 6h28" />
            <path d="M66 108h56M66 118h40" />
          </g>
          <circle className="accent" cx="150" cy="30" r="9" />
          <path d="M150 25v10M145 30h10" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <path d="M54 30h78l40 45-40 45H54z" />
            <path d="M48 38h78l40 45" opacity="0.4" />
            <path d="M74 60l32 32" />
            <circle cx="76" cy="90" r="5" />
            <circle cx="104" cy="62" r="5" />
          </g>
          <circle className="accent" cx="146" cy="75" r="7" />
          <g stroke="currentColor" strokeWidth="1.5">
            {BARCODE_X.map((x) => (
              <path key={x} d={`M${x} 108v10`} />
            ))}
          </g>
        </svg>
      );
    case "window":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="70" y="16" width="120" height="88" opacity="0.35" />
            <rect x="50" y="30" width="120" height="96" fill="var(--card)" />
            <path d="M50 48h120" />
            <circle cx="72" cy="39" r="3" />
            <circle cx="82" cy="39" r="3" />
            <path d="M64 66h56M64 78h80M64 90h40M64 102h64" />
          </g>
          <circle className="accent" cx="62" cy="39" r="3.5" />
          <rect className="accent" x="132" y="86" width="26" height="26" />
        </svg>
      );
    case "nodes":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="34" y="20" width="44" height="110" />
            <rect x="88" y="20" width="44" height="110" />
            <rect x="142" y="20" width="44" height="110" />
            <rect x="40" y="30" width="32" height="18" />
            <rect x="40" y="54" width="32" height="18" />
            <rect x="94" y="30" width="32" height="18" />
            <rect x="148" y="30" width="32" height="18" />
            <rect x="148" y="54" width="32" height="18" />
            <rect x="148" y="78" width="32" height="18" />
          </g>
          <rect
            className="accent"
            x="94"
            y="58"
            width="32"
            height="18"
            transform="rotate(-6 110 67)"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <path d="M40 30h96v52H70l-16 14V82H40z" />
            <path d="M84 66h96v50h-14v14l-16-14H84z" fill="var(--card)" />
            <path d="M54 46h60M54 60h36" />
          </g>
          <circle className="accent" cx="114" cy="92" r="4" />
          <circle className="accent" cx="130" cy="92" r="4" opacity="0.6" />
          <circle className="accent" cx="146" cy="92" r="4" opacity="0.3" />
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect
              x="56"
              y="22"
              width="84"
              height="100"
              transform="rotate(-8 98 72)"
              opacity="0.4"
            />
            <rect x="76" y="20" width="84" height="100" fill="var(--card)" />
            <rect x="84" y="28" width="68" height="66" />
            <path d="M84 84l20-22 16 16 10-10 22 22" />
          </g>
          <circle className="accent" cx="136" cy="44" r="7" />
        </svg>
      );
    case "desktop":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="30" y="16" width="160" height="100" />
            <path d="M30 26h160M90 116l-6 18h52l-6-18" />
            <rect x="52" y="40" width="70" height="48" />
            <rect x="68" y="98" width="84" height="12" />
          </g>
          <g stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="73" y="101" width="6" height="6" />
            <rect x="83" y="101" width="6" height="6" />
            <rect x="103" y="101" width="6" height="6" />
            <rect x="113" y="101" width="6" height="6" />
          </g>
          <rect className="accent" x="93" y="101" width="6" height="6" />
          <circle className="accent" cx="60" cy="47" r="2.5" />
        </svg>
      );
    case "open":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <rect
            x="50"
            y="20"
            width="120"
            height="110"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <circle className="accent" cx="110" cy="75" r="14" />
          <path
            d="M110 68v14M103 75h14"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function ExternalIcon() {
  return (
    <svg
      className="external"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6 10l4-4M6.5 6H10v3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
