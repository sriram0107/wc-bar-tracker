"use client";

import type { Bar } from "@/types/bar";

interface BarCardProps {
  bar: Bar;
  isSelected: boolean;
  onSelect: (bar: Bar) => void;
}

/** Fan hub country → flag emoji for quick visual scan */
const FAN_HUB_FLAGS: Record<string, string> = {
  Croatia: "🇭🇷",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Mexico: "🇲🇽",
  Portugal: "🇵🇹",
  Spain: "🇪🇸",
};

function fanHubLabel(fanHub: string): string {
  const flag = FAN_HUB_FLAGS[fanHub] ?? "🏟️";
  return `${flag} ${fanHub} Fan Hub`;
}

/**
 * Scrollable list item for a single bar.
 * Clicking selects the bar and pans the map (handled by parent).
 */
export function BarCard({ bar, isSelected, onSelect }: BarCardProps) {
  const hasFanHub = bar.fan_hub && bar.fan_hub !== "None";

  return (
    <button
      type="button"
      onClick={() => onSelect(bar)}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-pitch-500 bg-pitch-50 shadow-md ring-2 ring-pitch-500/30"
          : "border-gray-200 bg-white hover:border-pitch-500/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-gray-900">{bar.name}</h3>
        {bar.distance_km != null && (
          <span className="shrink-0 text-xs font-medium text-gray-500">
            {bar.distance_km} km
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {bar.entry_type}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {bar.cover_charge}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {bar.audio_status}
        </span>
      </div>

      {hasFanHub && (
        <p className="mt-2 text-sm font-semibold text-pitch-700">
          {fanHubLabel(bar.fan_hub)}
        </p>
      )}

      <p className="mt-2 text-sm italic text-gray-500">{bar.vibe_notes}</p>
    </button>
  );
}
