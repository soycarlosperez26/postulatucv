"use client";

import { useState } from "react";

export interface OfferTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function OfferTabs({ tabs }: { tabs: OfferTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-6 border-b border-line">
        {tabs.map((tab) => {
          const on = tab.id === current?.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`-mb-px border-b-2 px-0.5 pb-3 text-[14.5px] transition ${
                on
                  ? "border-brand font-bold text-ink"
                  : "border-transparent font-medium text-muted-soft hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {current?.content}
    </div>
  );
}
