"use client";

import { track } from "@/lib/analytics";

export interface BarFilters {
  walkInsOnly: boolean;
  noCoverOnly: boolean;
  gameAudioOnly: boolean;
}

interface FilterPillsProps {
  filters: BarFilters;
  onChange: (filters: BarFilters) => void;
}

const PILLS: {
  key: keyof BarFilters | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "noCoverOnly", label: "No Cover" },
  { key: "gameAudioOnly", label: "Game Audio" },
  { key: "walkInsOnly", label: "Walk-ins" },
];

function isAllActive(filters: BarFilters): boolean {
  return !filters.walkInsOnly && !filters.noCoverOnly && !filters.gameAudioOnly;
}

/** Pill toggles for client-side bar filtering */
export function FilterPills({ filters, onChange }: FilterPillsProps) {
  const toggle = (key: keyof BarFilters | "all") => {
    if (key === "all") {
      track("filter_toggled", { filter: "all", enabled: true });
      onChange({
        walkInsOnly: false,
        noCoverOnly: false,
        gameAudioOnly: false,
      });
      return;
    }

    const enabled = !filters[key];
    track("filter_toggled", { filter: key, enabled });
    onChange({ ...filters, [key]: enabled });
  };

  return (
    <div>
      <p className="mb-2 font-display text-sm tracking-wider text-wc-muted">
        FIND YOUR VIBE
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {PILLS.map(({ key, label }) => {
          const active =
            key === "all" ? isAllActive(filters) : filters[key as keyof BarFilters];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                active
                  ? "bg-wc-neon text-wc-navy shadow-neon-sm"
                  : "border border-wc-border bg-wc-surface text-wc-muted hover:border-wc-neon/40 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
