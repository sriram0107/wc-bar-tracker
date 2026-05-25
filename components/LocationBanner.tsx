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
      className={`shrink-0 px-4 py-2 text-sm ${
        status === "denied" || status === "unavailable"
          ? "bg-amber-50 text-amber-900"
          : "bg-pitch-100 text-pitch-900"
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
            className="shrink-0 rounded-full bg-pitch-600 px-3 py-1 text-xs font-medium text-white hover:bg-pitch-700"
          >
            Use my location
          </button>
        </div>
      )}
    </div>
  );
}
