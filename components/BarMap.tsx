"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, Popup, Source, type MapRef } from "react-map-gl";
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

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const radiusGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        circlePolygon(userLocation.lng, userLocation.lat, radiusKm),
      ],
    }),
    [userLocation.lat, userLocation.lng, radiusKm]
  );

  const flyToBar = useCallback(
    (bar: Bar) => {
      mapRef.current?.flyTo({
        center: [bar.lng, bar.lat],
        zoom: 15,
        duration: 1200,
      });
      onSelectBar(bar);
    },
    [onSelectBar]
  );

  useEffect(() => {
    flyToBarRef.current = flyToBar;
    return () => {
      flyToBarRef.current = null;
    };
  }, [flyToBar, flyToBarRef]);

  // Keep map centered on user when location or radius changes
  useEffect(() => {
    mapRef.current?.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: zoomForRadiusKm(radiusKm),
      duration: 800,
    });
  }, [userLocation.lat, userLocation.lng, radiusKm]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 p-6 text-center text-sm text-gray-600">
        Set{" "}
        <code className="mx-1 rounded bg-gray-200 px-1">
          NEXT_PUBLIC_MAPBOX_TOKEN
        </code>{" "}
        in <code className="mx-1 rounded bg-gray-200 px-1">.env.local</code> to
        load the map.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          zoom: zoomForRadiusKm(radiusKm),
        }}
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        attributionControl
      >
        <Source id="search-radius" type="geojson" data={radiusGeoJson}>
          <Layer
            id="search-radius-fill"
            type="fill"
            paint={{
              "fill-color": "#16a34a",
              "fill-opacity": 0.12,
            }}
          />
          <Layer
            id="search-radius-outline"
            type="line"
            paint={{
              "line-color": "#15803d",
              "line-width": 2,
              "line-dasharray": [2, 2],
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

        {bars.map((bar) => (
          <Marker
            key={bar.id}
            latitude={bar.lat}
            longitude={bar.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectBar(bar);
            }}
          >
            <div
              className={`cursor-pointer rounded-full border-2 border-white px-2 py-1 text-xs font-bold shadow-lg transition-transform ${
                selectedBar?.id === bar.id
                  ? "scale-110 bg-pitch-600 text-white"
                  : "bg-pitch-500 text-white"
              }`}
              title={bar.name}
            >
              ⚽
            </div>
          </Marker>
        ))}

        {selectedBar && (
          <Popup
            latitude={selectedBar.lat}
            longitude={selectedBar.lng}
            anchor="top"
            onClose={() => onSelectBar(null)}
            closeOnClick={false}
            className="bar-popup"
          >
            <div className="min-w-[160px] p-1">
              <p className="font-bold text-gray-900">{selectedBar.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                {selectedBar.cover_charge} · {selectedBar.entry_type}
              </p>
              {selectedBar.distance_km != null && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {selectedBar.distance_km} km away
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow-sm">
        Blue dot = you · green circle = {radiusKm} km search radius
      </p>
    </div>
  );
}
