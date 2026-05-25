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
  key: keyof BarFilters;
  label: string;
}[] = [
  { key: "walkInsOnly", label: "Walk-ins Only" },
  { key: "noCoverOnly", label: "No Cover" },
  { key: "gameAudioOnly", label: "Game Audio" },
];

/** Pill toggles for client-side bar filtering */
export function FilterPills({ filters, onChange }: FilterPillsProps) {
  const toggle = (key: keyof BarFilters) => {
    const enabled = !filters[key];
    track("filter_toggled", { filter: key, enabled });
    onChange({ ...filters, [key]: enabled });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map(({ key, label }) => {
        const active = filters[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-pitch-600 text-white shadow-sm"
                : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
