"use client";

import { useState } from "react";

const ALL = "All";

export type StackTile = {
  key: string;
  category: string;
  node: React.ReactNode;
};

export function StackExplorer({
  categories,
  tiles,
}: {
  categories: string[];
  tiles: StackTile[];
}) {
  const [active, setActive] = useState(ALL);
  const visible =
    active === ALL ? tiles : tiles.filter((tile) => tile.category === active);

  return (
    <>
      <div className="home-band">
        <div className="home-frame flex overflow-x-auto [scrollbar-width:none]">
          {[ALL, ...categories].map((category) => (
            <div
              key={category}
              className="flex shrink-0 items-center border-r border-line p-2 last:border-r-0 xl:flex-1 xl:justify-center"
            >
              <button
                type="button"
                className="home-tab"
                aria-pressed={active === category}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="home-band">
        <ul className="home-frame grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
          {visible.map((tile) => (
            <li key={tile.key} className="-mt-px border-t border-r border-line">
              {tile.node}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
