import {
  distanceBetween,
  geohashForLocation,
  type Geopoint,
} from "geofire-common";

/** Encode lat/lng as a geohash string (client + server safe) */
export function encodeGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

/**
 * Haversine distance in kilometres between two points.
 * geofire-common v6+ returns km (older versions returned metres).
 */
export function distanceKm(from: Geopoint, to: Geopoint): number {
  return distanceBetween(from, to);
}

/** True if `point` lies within `radiusKm` of `center` */
export function isWithinRadius(
  center: Geopoint,
  point: Geopoint,
  radiusKm: number
): boolean {
  return distanceKm(center, point) <= radiusKm;
}
