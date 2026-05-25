/**
 * Shape of a bar document stored in Firestore and returned by our API.
 * Field names match the Firestore schema exactly.
 */
export type EntryType = "Walk-in" | "Reservation" | "Ticketed";

export type AudioStatus = "Full Audio" | "Visual Only";

export interface Bar {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Geohash for Firestore geospatial range queries (GeoFire encoding) */
  geohash: string;
  is_streaming_wc: boolean;
  entry_type: EntryType;
  cover_charge: string;
  fan_hub: string;
  vibe_notes: string;
  audio_status: AudioStatus;
  /** Present when fetched via radius query — distance from search center in km */
  distance_km?: number;
}

export interface GeoQueryCenter {
  lat: number;
  lng: number;
}
