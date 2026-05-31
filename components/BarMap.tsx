"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl";
import { circlePolygon } from "@/lib/geojsonCircle";
import type { Bar, GeoQueryCenter } from "@/types/bar";
import "mapbox-gl/dist/mapbox-gl.css";

interface BarMapProps {
  bars: Bar[];
  selectedBar: Bar | null;
  onSelectBar: (bar: Bar | null) => void;
  /** User location — fixed search center (not map pan) */
  userLocation: GeoQueryCenter;
  radiusKm: number;
  flyToBarRef: React.MutableRefObject<((bar: Bar) => void) | null>;
}

/** Pick a zoom level so the radius circle fits comfortably in view */
function zoomForRadiusKm(radiusKm: number): number {
  if (radiusKm <= 1) return 14;
  if (radiusKm <= 3) return 13;
  if (radiusKm <= 5) return 12;
  if (radiusKm <= 10) return 11;
  if (radiusKm <= 20) return 10;
  return 9;
}

/** Plain GeoJSON object — avoids Mapbox choking on non-serializable props */
function buildRadiusGeoJson(
  lat: number,
  lng: number,
  radiusKm: number
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [circlePolygon(lng, lat, radiusKm)],
  };
}

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

function Tag({ icon, label, highlight }: { icon: string; label: string; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${highlight
        ? "border border-wc-neon/40 bg-wc-neon/10 text-wc-neon"
        : "border border-wc-border bg-wc-surface text-wc-muted"
        }`}
    >
      {icon} {label}
    </span>
  );
}

/** Rich slide-up detail panel shown on the map when a bar is selected */
function BarDetailPanel({
  bar,
  onClose,
}: {
  bar: Bar;
  onClose: () => void;
}) {
  const hasFanHub = bar.fan_hub && bar.fan_hub !== "None";
  const flagEmoji = hasFanHub ? (FAN_HUB_FLAGS[bar.fan_hub] ?? "🏟️") : null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20"
      style={{ animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {/* Transparent tap-to-dismiss area above the panel */}
      <div
        className="absolute inset-x-0 bottom-full top-[-100vh]"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-lg rounded-t-2xl border border-wc-border/80 bg-wc-card shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-10 rounded-full bg-wc-border" />
        </div>

        {/* Header row */}
        <div className="flex items-start gap-3 px-4 pb-3 pt-1">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg tracking-wide text-white leading-tight">
              {bar.name}
            </h2>
            {bar.distance_km != null && (
              <p className="mt-0.5 text-xs font-semibold text-wc-neon">
                📍 {bar.distance_km} km away
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-wc-muted transition hover:bg-wc-surface hover:text-white"
            aria-label="Close bar details"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          <Tag
            icon={bar.entry_type === "Walk-in" ? "🚶" : bar.entry_type === "Reservation" ? "📅" : "🎟"}
            label={bar.entry_type}
            highlight={bar.entry_type === "Walk-in"}
          />
          <Tag
            icon={bar.cover_charge === "No Cover" ? "✓" : "💰"}
            label={bar.cover_charge}
            highlight={bar.cover_charge === "No Cover"}
          />
          <Tag
            icon={bar.audio_status === "Full Audio" ? "🔊" : "📺"}
            label={bar.audio_status}
            highlight={bar.audio_status === "Full Audio"}
          />
          {bar.is_streaming_wc && (
            <Tag icon="📡" label="Streaming WC" highlight />
          )}
        </div>

        {/* Fan hub */}
        {hasFanHub && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-wc-purple/30 bg-wc-purple/10 px-3 py-2">
            <span className="text-base">{flagEmoji}</span>
            <div>
              <p className="text-xs font-bold text-wc-purple-light">
                {bar.fan_hub} Fan Hub
              </p>
              <p className="text-[10px] text-wc-muted">Official supporter section</p>
            </div>
          </div>
        )}

        {/* Vibe notes */}
        {bar.vibe_notes && (
          <div className="border-t border-wc-border/60 px-4 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-wc-muted">
              Vibe
            </p>
            <p className="text-sm italic text-wc-muted leading-relaxed">
              &ldquo;{bar.vibe_notes}&rdquo;
            </p>
          </div>
        )}

        {/* Safe area for mobile */}
        <div className="h-3" />
      </div>
    </div>
  );
}

/**
 * Map centered on the user's location with a radius overlay.
 * Only bars passed in props are rendered (already filtered to radius).
 */
export function BarMap({
  bars,
  selectedBar,
  onSelectBar,
  userLocation,
  radiusKm,
  flyToBarRef,
}: BarMapProps) {
  const mapRef = useRef<MapRef>(null);
  const flyingRef = useRef(false);
  const lastCameraTargetRef = useRef<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const radiusGeoJson = useMemo(
    () =>
      buildRadiusGeoJson(userLocation.lat, userLocation.lng, radiusKm),
    [userLocation.lat, userLocation.lng, radiusKm]
  );

  const flyTo = useCallback(
    (
      lng: number,
      lat: number,
      zoom: number,
      targetKey: string,
      duration = 800
    ) => {
      if (lastCameraTargetRef.current === targetKey) return;
      if (flyingRef.current) return;

      const map = mapRef.current?.getMap();
      if (!map) return;

      lastCameraTargetRef.current = targetKey;
      flyingRef.current = true;

      map.stop();
      map.flyTo({
        center: [lng, lat],
        zoom,
        duration,
        essential: true,
      });

      window.setTimeout(() => {
        flyingRef.current = false;
      }, duration + 100);
    },
    []
  );

  const flyToBar = useCallback(
    (bar: Bar) => {
      flyTo(bar.lng, bar.lat, 15, `bar:${bar.id}`, 1200);
    },
    [flyTo]
  );

  useEffect(() => {
    flyToBarRef.current = flyToBar;
    return () => {
      flyToBarRef.current = null;
    };
  }, [flyToBar, flyToBarRef]);

  // Recenter on user when location or search radius changes (not on bar selection)
  useEffect(() => {
    const key = `user:${userLocation.lat},${userLocation.lng},${radiusKm}`;
    flyTo(
      userLocation.lng,
      userLocation.lat,
      zoomForRadiusKm(radiusKm),
      key
    );
  }, [userLocation.lat, userLocation.lng, radiusKm, flyTo]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-wc-surface p-6 text-center text-sm text-wc-muted">
        Set{" "}
        <code className="mx-1 rounded bg-wc-card px-1 text-wc-neon">
          NEXT_PUBLIC_MAPBOX_TOKEN
        </code>{" "}
        in <code className="mx-1 rounded bg-wc-card px-1 text-wc-neon">.env.local</code> to
        load the map.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          zoom: zoomForRadiusKm(radiusKm),
        }}
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: "100%", height: "100%" }}
        attributionControl
        // Restrict pan/zoom to Greater Toronto Area
        maxBounds={[
          [-80.05, 43.45], // SW corner (Oakville/Hamilton border)
          [-78.85, 44.05], // NE corner (Markham/Oshawa)
        ]}
        minZoom={9}
        maxZoom={18}
        onClick={() => {
          // Click on the map canvas (not a marker) dismisses selection
          if (selectedBar) onSelectBar(null);
        }}
      >
        <Source id="search-radius" type="geojson" data={radiusGeoJson}>
          <Layer
            id="search-radius-fill"
            type="fill"
            paint={{
              "fill-color": "#39ff14",
              "fill-opacity": 0.06,
            }}
          />
          <Layer
            id="search-radius-outline"
            type="line"
            paint={{
              "line-color": "#39ff14",
              "line-width": 1.5,
              "line-dasharray": [3, 3],
            }}
          />
        </Source>

        {/* User location — search center */}
        <Marker
          latitude={userLocation.lat}
          longitude={userLocation.lng}
          anchor="center"
        >
          <div
            className="relative flex h-5 w-5 items-center justify-center"
            title="You are here"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
            <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-md" />
          </div>
        </Marker>

        {bars.map((bar) => {
          const isSelected = selectedBar?.id === bar.id;
          return (
            <Marker
              key={bar.id}
              latitude={bar.lat}
              longitude={bar.lng}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectBar(isSelected ? null : bar);
              }}
            >
              <div
                className={`relative flex cursor-pointer items-center justify-center rounded-full border-2 text-base transition-all duration-200 ${isSelected
                  ? "h-11 w-11 scale-110 border-wc-neon bg-wc-neon/25 shadow-[0_0_16px_rgba(57,255,20,0.6)]"
                  : "h-9 w-9 border-wc-neon/50 bg-wc-card/90 hover:scale-110 hover:border-wc-neon hover:bg-wc-neon/15"
                  }`}
                title={bar.name}
              >
                ⚽
                {isSelected && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-wc-neon shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
                )}
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Rich detail panel — slide up from bottom of map */}
      {selectedBar && (
        <BarDetailPanel bar={selectedBar} onClose={() => onSelectBar(null)} />
      )}

      {/* Map legend */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10">
        <div className="rounded-xl border border-wc-border/60 bg-wc-navy/80 px-3 py-1.5 text-[10px] text-wc-muted backdrop-blur-sm">
          <span className="text-blue-400">●</span> You ·{" "}
          <span className="text-wc-neon">○</span> {radiusKm} km radius
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
