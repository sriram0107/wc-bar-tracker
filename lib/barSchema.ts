import { z } from "zod";
import type { Bar } from "@/types/bar";

export const entryTypeSchema = z.enum([
  "Walk-in",
  "Walk-in friendly",
  "Reservation",
  "Recommended reservation",
  "Reservation required",
  "Reservations for groups",
  "Bookable",
  "Ticketed",
]);
export const audioStatusSchema = z.enum(["Full Audio", "Muted / Subtitles", "Visual Only"]);

export const barDocumentSchema = z.object({
  name: z.string().min(1).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  geohash: z.string().min(1).max(20),
  is_streaming_wc: z.literal(true),
  entry_type: entryTypeSchema,
  cover_charge: z.string().min(1).max(100),
  fan_hub: z.string().max(100),
  vibe_notes: z.string().max(2000),
  audio_status: audioStatusSchema,
  image_url: z.string().url().optional(),
});

export const barSchema = barDocumentSchema.extend({
  id: z.string().min(1),
  distance_km: z.number().nonnegative().optional(),
});

export type BarDocument = z.infer<typeof barDocumentSchema>;

/** Parse a Firestore document into a validated Bar, or null if invalid. */
export function docToBar(
  id: string,
  data: Record<string, unknown>,
  distance_km?: number
): Bar | null {
  const parsed = barDocumentSchema.safeParse(data);
  if (!parsed.success) {
    console.warn(`[docToBar] Invalid bar document ${id}:`, parsed.error.flatten());
    return null;
  }

  return {
    id,
    ...parsed.data,
    ...(distance_km !== undefined && { distance_km }),
  };
}
