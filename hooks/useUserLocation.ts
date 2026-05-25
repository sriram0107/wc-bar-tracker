"use client";

import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { GeoQueryCenter } from "@/types/bar";

/** Toronto downtown — fallback when geolocation is denied or unavailable */
export const FALLBACK_CENTER: GeoQueryCenter = {
  lat: 43.6426,
  lng: -79.3871,
};

export type LocationStatus =
  | "prompt" // waiting to request permission
  | "loading"
  | "granted"
  | "denied"
  | "unavailable";

interface UseUserLocationResult {
  status: LocationStatus;
  position: GeoQueryCenter | null;
  error: string | null;
  /** Call from a button click if the browser blocks auto-prompt */
  requestLocation: () => void;
}

/**
 * Requests the user's geolocation once on mount (browser permission dialog).
 * Falls back to downtown Toronto if denied or unsupported.
 */
export function useUserLocation(): UseUserLocationResult {
  const [status, setStatus] = useState<LocationStatus>("prompt");
  const [position, setPosition] = useState<GeoQueryCenter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setError("Geolocation is not supported in this browser.");
      setPosition(FALLBACK_CENTER);
      track("location_denied");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setStatus("granted");
        track("location_granted");
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Using downtown Toronto as the search center."
            : err.code === err.TIMEOUT
              ? "Location request timed out. Using downtown Toronto."
              : "Could not get your location. Using downtown Toronto.";

        setError(message);
        setPosition(FALLBACK_CENTER);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
        track("location_denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 60_000,
      }
    );
  }, []);

  // Ask for permission as soon as the app loads
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { status, position, error, requestLocation };
}
