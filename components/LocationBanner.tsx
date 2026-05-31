"use client";

import type { LocationStatus } from "@/hooks/useUserLocation";

interface LocationBannerProps {
  status: LocationStatus;
  message: string | null;
  onRetry: () => void;
}

/** Shown while waiting for geolocation or if permission was denied */
export function LocationBanner({
  status,
  message,
  onRetry,
}: LocationBannerProps) {
  if (status === "granted") return null;

  const isLoading = status === "loading" || status === "prompt";

  return (
    <div
      className={`shrink-0 border-b px-4 py-2.5 text-sm ${
        status === "denied" || status === "unavailable"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : "border-wc-neon/20 bg-wc-neon/5 text-wc-neon"
      }`}
      role="status"
    >
      {isLoading ? (
        <p>Getting your location… Allow access when your browser asks.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>{message ?? "Using default map center."}</p>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-xl bg-wc-neon px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-wc-navy transition hover:brightness-110"
          >
            Use my location
          </button>
        </div>
      )}
    </div>
  );
}
