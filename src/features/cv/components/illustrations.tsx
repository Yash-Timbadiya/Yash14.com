type Name =
  | "pulse"
  | "tag"
  | "window"
  | "nodes"
  | "chat"
  | "live"
  | "portfolio"
  | "community"
  | "photos"
  | "desktop"
  | "open";

/** The front window's text lines, drawn one by one so they can retype. */
const WINDOW_LINES = ["M64 66h56", "M64 78h60", "M64 90h40", "M64 102h52"];

const BARCODE_X = Array.from({ length: 9 }, (_, i) => 158 + i * 3);

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Single-weight line drawings with one orange element each, drawn for this
 * page. Class names on the parts are animation hooks: cv.css moves them while
 * the card is hovered.
 */
export function Illustration({ name }: { name: Name }) {
  switch (name) {
    case "pulse":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect
              className="pulse-back"
              x="46"
              y="14"
              width="112"
              height="128"
            />
            <rect
              x="54"
              y="8"
              width="112"
              height="128"
              fill="var(--card-fill, var(--card))"
            />
            <path
              className="pulse-trace"
              d="M66 70h22l8-22 14 46 10-30 6 6h28"
              pathLength={1}
            />
            <path d="M66 108h56M66 118h40" />
          </g>
          <g className="pulse-badge">
            <circle className="accent" cx="150" cy="30" r="9" />
            <path d="M150 25v10M145 30h10" stroke="#fff" strokeWidth="2" />
          </g>
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <path
              className="tag-shadow"
              d="M46 38h78l40 45-40 45H46z"
              opacity="0.35"
            />
          </g>
          <g className="tag-body">
            <g {...STROKE}>
              <path
                d="M54 30h78l40 45-40 45H54z"
                fill="var(--card-fill, var(--card))"
              />
              <path d="M74 60l32 32" />
              <circle cx="76" cy="90" r="5" />
              <circle cx="104" cy="62" r="5" />
            </g>
            <circle className="accent" cx="146" cy="75" r="7" />
          </g>
          <g stroke="currentColor" strokeWidth="1.5">
            {BARCODE_X.map((x) => (
              <path key={x} className="tag-bar" d={`M${x} 108v10`} />
            ))}
          </g>
        </svg>
      );
    case "window":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect
              className="window-back"
              x="70"
              y="16"
              width="120"
              height="88"
              opacity="0.35"
            />
          </g>
          <g className="window-front">
            <g {...STROKE}>
              <rect
                x="50"
                y="30"
                width="120"
                height="96"
                fill="var(--card-fill, var(--card))"
              />
              <path d="M50 48h120" />
              <circle cx="72" cy="39" r="3" />
              <circle cx="82" cy="39" r="3" />
              {WINDOW_LINES.map((d) => (
                <path key={d} className="window-line" d={d} pathLength={1} />
              ))}
            </g>
            <circle className="accent" cx="62" cy="39" r="3.5" />
            <rect
              className="accent window-block"
              x="132"
              y="86"
              width="26"
              height="26"
            />
          </g>
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
            className="accent nodes-card"
            x="94"
            y="58"
            width="32"
            height="18"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <path d="M40 30h96v52H70l-16 14V82H40z" />
            <path
              className="chat-reply"
              d="M84 66h96v50h-14v14l-16-14H84z"
              fill="var(--card-fill, var(--card))"
            />
            <path d="M54 46h60M54 60h36" />
          </g>
          <g className="chat-dots">
            <circle className="accent" cx="114" cy="92" r="4" />
            <circle className="accent" cx="130" cy="92" r="4" opacity="0.6" />
            <circle className="accent" cx="146" cy="92" r="4" opacity="0.3" />
          </g>
        </svg>
      );
    case "portfolio":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="40" y="18" width="140" height="114" rx="6" />
            <path d="M40 34h140" />
            <circle cx="52" cy="26" r="2.5" />
            <circle cx="61" cy="26" r="2.5" />
            <circle cx="70" cy="26" r="2.5" />
            <circle cx="76" cy="62" r="14" />
            <path d="M100 56h52M100 68h34" />
            <rect
              className="folio-tile"
              x="56"
              y="94"
              width="30"
              height="22"
              rx="3"
            />
            <rect
              className="folio-tile"
              x="128"
              y="94"
              width="30"
              height="22"
              rx="3"
            />
          </g>
          <rect
            className="accent folio-tile"
            x="92"
            y="94"
            width="30"
            height="22"
            rx="3"
          />
          <g transform="translate(150 112)">
            <path
              className="folio-cursor"
              d="M0 0v15l4-4 3 7 3-1.4-3-6.8h5.6z"
              fill="var(--card-fill, var(--card))"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="26" y="20" width="168" height="114" rx="6" />
            <path d="M72 20v114" />
            <path d="M38 40h22M38 68h18M38 82h22M38 96h14" />
            <rect x="80" y="30" width="48" height="44" rx="4" />
            <circle cx="104" cy="47" r="6" />
            <path d="M93 67a11 9 0 0 1 22 0" />
            <rect x="136" y="30" width="48" height="44" rx="4" />
            <circle cx="160" cy="47" r="6" />
            <path d="M149 67a11 9 0 0 1 22 0" />
            <rect x="80" y="82" width="48" height="44" rx="4" />
            <circle cx="104" cy="99" r="6" />
            <path d="M93 119a11 9 0 0 1 22 0" />
            <rect x="136" y="82" width="48" height="44" rx="4" />
            <circle cx="160" cy="99" r="6" />
            <path d="M149 119a11 9 0 0 1 22 0" />
          </g>
          <rect className="accent" x="36" y="51" width="26" height="6" rx="3" />
          <rect
            className="community-speaker"
            x="80"
            y="30"
            width="48"
            height="44"
            rx="4"
            fill="none"
            stroke="var(--orange)"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "live":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect x="34" y="34" width="44" height="82" rx="8" />
            <rect x="142" y="34" width="44" height="82" rx="8" />
            <path d="M48 104h16M156 104h16" />
            <path d="M44 50h24M44 60h16M152 72h24M160 82h16" />
            <path className="live-wire" d="M86 75h48" strokeDasharray="3 5" />
          </g>
          <circle className="accent live-signal" cx="92" cy="75" r="5" />
          <circle className="accent" cx="68" cy="44" r="3" />
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <g {...STROKE}>
            <rect
              className="photos-back"
              x="56"
              y="22"
              width="84"
              height="100"
              opacity="0.4"
            />
          </g>
          <g className="photos-front">
            <g {...STROKE}>
              <rect
                x="76"
                y="20"
                width="84"
                height="100"
                fill="var(--card-fill, var(--card))"
              />
              <rect x="84" y="28" width="68" height="66" />
              <path d="M84 84l20-22 16 16 10-10 22 22" />
            </g>
            <circle className="accent photos-sun" cx="136" cy="44" r="7" />
          </g>
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
          <rect
            className="accent desktop-key"
            x="93"
            y="101"
            width="6"
            height="6"
          />
          <circle className="accent desktop-cursor" cx="60" cy="47" r="2.5" />
        </svg>
      );
    case "open":
      return (
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <rect
            className="open-frame"
            x="50"
            y="20"
            width="120"
            height="110"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <g className="open-plus">
            <circle className="accent" cx="110" cy="75" r="14" />
            <path
              d="M110 68v14M103 75h14"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
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
      <path
        d="M7 2.59082C4.43989 3.06109 2.5 5.30394 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5C10.6961 13.5 12.9389 11.5601 13.4092 9H14.9287C14.4435 12.3923 11.5265 15 8 15C4.13401 15 1 11.866 1 8C1 4.47355 3.60773 1.55654 7 1.07129V2.59082ZM15 7H13.5V3.56055L8.53027 8.53027L7.46973 7.46973L12.4395 2.5H9V1H15V7Z"
        fill="currentColor"
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
