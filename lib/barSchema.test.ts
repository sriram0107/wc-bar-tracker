import { describe, expect, it } from "vitest";
import { docToBar } from "@/lib/barSchema";

const validDoc = {
  name: "Test Bar",
  lat: 43.65,
  lng: -79.38,
  geohash: "dpz83f7",
  is_streaming_wc: true,
  entry_type: "Walk-in",
  cover_charge: "No Cover",
  fan_hub: "None",
  vibe_notes: "Great vibes",
  audio_status: "Full Audio",
};

describe("docToBar", () => {
  it("parses a valid document", () => {
    const bar = docToBar("abc", validDoc);
    expect(bar).toMatchObject({ id: "abc", name: "Test Bar" });
  });

  it("returns null for invalid documents", () => {
    expect(docToBar("x", { ...validDoc, lat: 999 })).toBeNull();
    expect(docToBar("x", { name: "only name" })).toBeNull();
  });

  it("includes distance_km when provided", () => {
    const bar = docToBar("abc", validDoc, 2.5);
    expect(bar?.distance_km).toBe(2.5);
  });
});
