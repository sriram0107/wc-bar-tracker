"use client";

import { useCallback, useState } from "react";
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

const TAG_ICONS: Record<string, string> = {
  "Walk-in": "🚶",
  Reservation: "📅",
  Ticketed: "🎟",
  "No Cover": "✓",
  "Full Audio": "🔊",
  "Visual Only": "📺",
};

/**
 * Scrollable list item for a single bar.
 * Clicking selects the bar and pans the map (handled by parent).
 */
export function BarCard({ bar, isSelected, onSelect }: BarCardProps) {
  const hasFanHub = bar.fan_hub && bar.fan_hub !== "None";
  const [favorited, setFavorited] = useState(false);

  const toggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setFavorited((f) => !f);
    },
    []
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(bar)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(bar);
        }
      }}
      className={`group w-full cursor-pointer overflow-hidden rounded-2xl border text-left transition-all ${isSelected
          ? "border-wc-neon/60 bg-wc-card shadow-neon-sm ring-1 ring-wc-neon/30"
          : "border-wc-border bg-wc-card hover:border-wc-neon/30 hover:bg-card-shimmer"
        }`}
    >
      <div className="p-3">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-white">{bar.name}</h3>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`shrink-0 text-lg transition ${favorited ? "text-red-400" : "text-wc-muted hover:text-red-400"
                }`}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              {favorited ? "♥" : "♡"}
            </button>
          </div>

          {bar.distance_km != null && (
            <p className="mt-0.5 text-xs text-wc-neon">
              {bar.distance_km} km away
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-wc-border bg-wc-surface px-2 py-0.5 text-[10px] font-medium text-wc-muted">
              {TAG_ICONS[bar.entry_type] ?? "•"} {bar.entry_type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-wc-border bg-wc-surface px-2 py-0.5 text-[10px] font-medium text-wc-muted">
              {TAG_ICONS[bar.cover_charge] ?? "•"} {bar.cover_charge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-wc-border bg-wc-surface px-2 py-0.5 text-[10px] font-medium text-wc-muted">
              {TAG_ICONS[bar.audio_status] ?? "•"} {bar.audio_status}
            </span>
          </div>
        </div>
      </div>

      {(hasFanHub || bar.vibe_notes) && (
        <div className="border-t border-wc-border/60 px-3 py-2">
          {hasFanHub && (
            <p className="text-xs font-semibold text-wc-purple-light">
              {fanHubLabel(bar.fan_hub)}
            </p>
          )}
          {bar.vibe_notes && (
            <p className="mt-1 line-clamp-2 text-xs italic text-wc-muted">
              {bar.vibe_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
