/** GeoJSON polygon feature for Mapbox radius overlay */
export interface CircleFeature {
  type: "Feature";
  properties: { radiusKm: number };
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

/**
 * Approximate a circle on the WGS84 ellipsoid as a GeoJSON polygon.
 * Used to draw the search radius on the Mapbox map.
 */
export function circlePolygon(
  centerLng: number,
  centerLat: number,
  radiusKm: number,
  points = 64
): CircleFeature {
  const ring: [number, number][] = [];
  const latRad = (centerLat * Math.PI) / 180;
  const kmPerDegreeLat = 110.574;
  const kmPerDegreeLng = 111.32 * Math.cos(latRad);

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = (radiusKm / kmPerDegreeLng) * Math.cos(angle);
    const dy = (radiusKm / kmPerDegreeLat) * Math.sin(angle);
    ring.push([centerLng + dx, centerLat + dy]);
  }

  return {
    type: "Feature",
    properties: { radiusKm },
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}
