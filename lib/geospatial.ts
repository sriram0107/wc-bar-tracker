import { geohashQueryBounds, type Geopoint } from "geofire-common";
import type { Firestore } from "firebase-admin/firestore";
import { docToBar } from "@/lib/barSchema";
import { distanceKm } from "@/lib/geo";
import type { Bar } from "@/types/bar";

export { encodeGeohash, distanceKm } from "@/lib/geo";

/**
 * Single Firestore read — all World Cup streaming bars (~50 docs).
 * Radius and attribute filtering happen on the client to minimize read costs.
 */
export async function fetchAllStreamingBars(db: Firestore): Promise<Bar[]> {
  const snapshot = await db
    .collection("bars")
    .where("is_streaming_wc", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => docToBar(doc.id, doc.data()))
    .filter((bar): bar is Bar => bar !== null);
}

/**
 * Query bars within a radius using geohash prefix bounds (GeoFire pattern).
 * Kept for optional server-side geo queries; the app uses fetchAllStreamingBars instead.
 */
export async function queryBarsInRadius(
  db: Firestore,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Promise<Bar[]> {
  const center: Geopoint = [centerLat, centerLng];
  const radiusM = radiusKm * 1000;
  const bounds = geohashQueryBounds(center, radiusM);

  // One Firestore query per geohash bound (typically 1–10 for practical radii)
  const snapshots = await Promise.all(
    bounds.map(([start, end]) =>
      db
        .collection("bars")
        .orderBy("geohash")
        .startAt(start)
        .endAt(end)
        .get()
    )
  );

  const seen = new Set<string>();
  const bars: Bar[] = [];

  for (const snapshot of snapshots) {
    for (const doc of snapshot.docs) {
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);

      const data = doc.data();
      if (!data.is_streaming_wc) continue;

      const barPoint: Geopoint = [data.lat as number, data.lng as number];
      const dist = distanceKm(center, barPoint);
      if (dist > radiusKm) continue;

      const bar = docToBar(doc.id, data, Math.round(dist * 10) / 10);
      if (bar) bars.push(bar);
    }
  }

  bars.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  return bars;
}
