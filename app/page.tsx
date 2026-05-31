"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BarCard } from "@/components/BarCard";
import { BarMap } from "@/components/BarMap";
import { BarOwnerCTA } from "@/components/BarOwnerCTA";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPills, type BarFilters } from "@/components/FilterPills";
import { LocationBanner } from "@/components/LocationBanner";
import {
  MobileBottomNav,
  type MobileView,
} from "@/components/MobileBottomNav";
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

const DEFAULT_RADIUS_KM = 5;

/**
 * One catalog fetch per session; radius, distance, and attribute filters are client-side.
 */
export default function HomePage() {
  const {
    allBars,
    loading: catalogLoading,
    error: catalogError,
    retry: retryCatalog,
  } = useBarsCatalog();
  const { status, position, error: locationError, requestLocation } =
    useUserLocation();

  const userLocation = position ?? FALLBACK_CENTER;
  const locationReady = position !== null;

  const [filters, setFilters] = useState<BarFilters>(DEFAULT_FILTERS);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const flyToBarRef = useRef<((bar: Bar) => void) | null>(null);
  const lastSearchTracked = useRef<string | null>(null);
  const selectedBarListRef = useRef<HTMLLIElement | null>(null);

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
      if (filters.walkInsOnly && bar.entry_type !== "Walk-in" && bar.entry_type !== "Walk-in friendly") return false;
      if (filters.noCoverOnly && bar.cover_charge !== "No Cover") return false;
      if (filters.gameAudioOnly && bar.audio_status !== "Full Audio")
        return false;
      return true;
    });
  }, [barsInRadius, filters]);

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
      setSelectedBar((prev) => (prev?.id === bar.id ? prev : bar));
      flyToBarRef.current?.(bar);
      setMobileView("map");
      // Scroll the bar into view in the left list
      window.requestAnimationFrame(() => {
        selectedBarListRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      return;
    }
    setSelectedBar(null);
  }, []);

  const handleRadiusChange = useCallback((km: number) => {
    track("radius_changed", { radius_km: km });
    setRadiusKm(km);
    setSelectedBar(null);
  }, []);

  const isLoading = catalogLoading || !locationReady;
  const error = catalogError;

  const showList = mobileView === "list";
  const showMap = mobileView === "map";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-wc-navy">
      <AppHeader />

      {/* Slim branded banner */}
      <div className="flex shrink-0 items-center gap-4 border-b border-wc-border/60 bg-wc-navy/90 px-4 py-1.5 backdrop-blur-sm">
        <span className="rounded-full border border-wc-gold/30 bg-wc-gold/10 px-2.5 py-0.5 font-display text-[10px] tracking-[0.25em] text-wc-gold">
          TORONTO · 2026
        </span>
        <span className="font-display text-sm tracking-wide text-white">LIVE THE GAME.</span>
        <span className="font-display text-sm tracking-wide text-wc-neon text-glow-neon">FEEL THE CITY.</span>
      </div>

      <LocationBanner
        status={status}
        message={locationError}
        onRetry={requestLocation}
      />

      <div
        id="explore"
        className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row"
      >
        <aside
          className={`order-2 flex min-h-0 flex-col border-t border-wc-border md:order-1 md:w-[380px] md:flex-none md:border-r md:border-t-0 md:overflow-hidden lg:w-[420px] ${showList ? "flex-1" : "hidden md:flex md:flex-1"
            }`}
        >
          <div className="shrink-0 space-y-3.5 border-b border-wc-border bg-wc-surface px-4 pb-3 pt-4">
            <FilterPills filters={filters} onChange={setFilters} />
            <RadiusControl radiusKm={radiusKm} onChange={handleRadiusChange} />
            <div className="flex items-center justify-between">
              <p className="text-xs text-wc-muted">
                {isLoading
                  ? catalogLoading
                    ? "Loading bars…"
                    : "Getting your location…"
                  : (
                    <>
                      <span className="font-semibold text-white">{filteredBars.length}</span>
                      {` bar${filteredBars.length === 1 ? "" : "s"} within `}
                      <span className="font-semibold text-wc-neon">{radiusKm} km</span>
                    </>
                  )}
              </p>
              {selectedBar && (
                <button
                  type="button"
                  onClick={() => setSelectedBar(null)}
                  className="text-[10px] text-wc-muted underline hover:text-white"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  <p className="whitespace-pre-wrap">{error}</p>
                  <button
                    type="button"
                    onClick={retryCatalog}
                    className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-500"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!isLoading && !error && filteredBars.length === 0 && (
                <p className="py-8 text-center text-sm text-wc-muted">
                  No bars within {radiusKm} km. Try increasing the search
                  radius.
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {filteredBars.map((bar) => {
                  const isSelected = selectedBar?.id === bar.id;
                  return (
                    <li
                      key={bar.id}
                      ref={isSelected ? selectedBarListRef : undefined}
                    >
                      <BarCard
                        bar={bar}
                        isSelected={isSelected}
                        onSelect={(b) => handleSelectBar(b)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="hidden shrink-0 p-4 md:block">
              <BarOwnerCTA />
            </div>
          </div>
        </aside>

        <main
          className={`relative order-1 min-h-0 overflow-hidden md:order-2 md:flex-1 ${showMap ? "flex-1" : "hidden md:block md:flex-1"
            }`}
        >
          {locationReady ? (
            <ErrorBoundary fallbackTitle="Map unavailable">
              <BarMap
                bars={filteredBars}
                selectedBar={selectedBar}
                onSelectBar={handleSelectBar}
                userLocation={userLocation}
                radiusKm={radiusKm}
                flyToBarRef={flyToBarRef}
              />
            </ErrorBoundary>
          ) : (
            <div className="flex h-full min-h-[50dvh] items-center justify-center bg-wc-surface text-sm text-wc-muted md:min-h-0">
              {catalogLoading ? "Loading bars…" : "Getting your location…"}
            </div>
          )}
        </main>
      </div>

      <div id="about" className="hidden" aria-hidden />

      <MobileBottomNav activeView={mobileView} onViewChange={setMobileView} />
    </div>
  );
}
