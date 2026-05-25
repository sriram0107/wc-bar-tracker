"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BarCard } from "@/components/BarCard";
import { BarMap } from "@/components/BarMap";
import { FilterPills, type BarFilters } from "@/components/FilterPills";
import { LocationBanner } from "@/components/LocationBanner";
import { RadiusControl } from "@/components/RadiusControl";
import { useBarsCatalog } from "@/hooks/useBarsCatalog";
import {
  FALLBACK_CENTER,
  useUserLocation,
} from "@/hooks/useUserLocation";
import { track } from "@/lib/analytics";
import { distanceKm, isWithinRadius } from "@/lib/geo";
import type { Bar } from "@/types/bar";

const DEFAULT_FILTERS: BarFilters = {
  walkInsOnly: false,
  noCoverOnly: false,
  gameAudioOnly: false,
};

const DEFAULT_RADIUS_KM = 10;

/**
 * One catalog fetch per session; radius, distance, and attribute filters are client-side.
 */
export default function HomePage() {
  const { allBars, loading: catalogLoading, error: catalogError } =
    useBarsCatalog();
  const { status, position, error: locationError, requestLocation } =
    useUserLocation();

  const userLocation = position ?? FALLBACK_CENTER;
  const locationReady = position !== null;

  const [filters, setFilters] = useState<BarFilters>(DEFAULT_FILTERS);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  const flyToBarRef = useRef<((bar: Bar) => void) | null>(null);
  const lastSearchTracked = useRef<string | null>(null);

  const barsInRadius = useMemo(() => {
    if (!locationReady) return [];

    const center: [number, number] = [userLocation.lat, userLocation.lng];
    return allBars
      .filter((bar) =>
        isWithinRadius(center, [bar.lat, bar.lng], radiusKm)
      )
      .map((bar) => ({
        ...bar,
        distance_km:
          Math.round(distanceKm(center, [bar.lat, bar.lng]) * 10) / 10,
      }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }, [allBars, locationReady, userLocation.lat, userLocation.lng, radiusKm]);

  const filteredBars = useMemo(() => {
    return barsInRadius.filter((bar) => {
      if (filters.walkInsOnly && bar.entry_type !== "Walk-in") return false;
      if (filters.noCoverOnly && bar.cover_charge !== "No Cover") return false;
      if (filters.gameAudioOnly && bar.audio_status !== "Full Audio")
        return false;
      return true;
    });
  }, [barsInRadius, filters]);

  // Analytics for client-side "search" (radius/location), not a new DB read
  useEffect(() => {
    if (!locationReady || catalogLoading) return;

    const key = `${userLocation.lat},${userLocation.lng},${radiusKm}`;
    if (lastSearchTracked.current === key) return;
    lastSearchTracked.current = key;

    track("search_completed", {
      radius_km: radiusKm,
      result_count: barsInRadius.length,
    });
  }, [
    locationReady,
    catalogLoading,
    userLocation.lat,
    userLocation.lng,
    radiusKm,
    barsInRadius.length,
  ]);

  // Drop selection when the bar falls outside radius or filters
  useEffect(() => {
    if (
      selectedBar &&
      !filteredBars.some((b) => b.id === selectedBar.id)
    ) {
      setSelectedBar(null);
    }
  }, [filteredBars, selectedBar]);

  const handleSelectBar = useCallback((bar: Bar | null) => {
    if (bar) {
      track("bar_selected", { bar_id: bar.id });
      flyToBarRef.current?.(bar);
    }
    setSelectedBar(bar);
  }, []);

  const handleRadiusChange = useCallback((km: number) => {
    track("radius_changed", { radius_km: km });
    setRadiusKm(km);
    setSelectedBar(null);
  }, []);

  const isLoading = catalogLoading || !locationReady;
  const error = catalogError;

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <AppHeader />

      <LocationBanner
        status={status}
        message={locationError}
        onRetry={requestLocation}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="order-2 flex min-h-0 flex-1 flex-col border-t border-gray-200 md:order-1 md:w-[30%] md:flex-none md:border-r md:border-t-0">
          <div className="shrink-0 space-y-3 border-b border-gray-200 bg-white p-3">
            <RadiusControl radiusKm={radiusKm} onChange={handleRadiusChange} />
            <FilterPills filters={filters} onChange={setFilters} />
            <p className="text-xs text-gray-500">
              {isLoading
                ? catalogLoading
                  ? "Loading bars…"
                  : "Waiting for location…"
                : `${filteredBars.length} bar${filteredBars.length === 1 ? "" : "s"} within ${radiusKm} km`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {error && (
              <p className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {!isLoading && !error && filteredBars.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No bars within {radiusKm} km. Try increasing the search radius.
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {filteredBars.map((bar) => (
                <li key={bar.id}>
                  <BarCard
                    bar={bar}
                    isSelected={selectedBar?.id === bar.id}
                    onSelect={(b) => handleSelectBar(b)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="relative order-1 min-h-0 flex-1 md:order-2 md:w-[70%]">
          {locationReady ? (
            <BarMap
              bars={filteredBars}
              selectedBar={selectedBar}
              onSelectBar={handleSelectBar}
              userLocation={userLocation}
              radiusKm={radiusKm}
              flyToBarRef={flyToBarRef}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-600">
              {catalogLoading ? "Loading bars…" : "Getting your location…"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
