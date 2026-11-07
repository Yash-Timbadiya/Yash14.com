/** A chevron that grows a shaft when its parent is hovered: ">" becomes "->". */
export function HoverArrow() {
  return (
    <svg
      className="home-arrow"
      width="5"
      height="8"
      fill="none"
      viewBox="0 0.5 5 8"
      aria-hidden="true"
    >
      <g className="home-arrow-group">
        <rect
          className="home-arrow-shaft"
          x="-3.5"
          y="3.375"
          width="7"
          height="1.75"
          fill="currentColor"
        />
        <path
          d="M4.84766 3.63379L5.45898 4.25L4.84766 4.86621L1.24219 8.49902L0 7.2666L2.99316 4.24902L0 1.23242L1.24219 0L4.84766 3.63379Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
