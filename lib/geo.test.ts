import { describe, expect, it } from "vitest";
import { distanceKm, encodeGeohash, isWithinRadius } from "@/lib/geo";

describe("geo", () => {
  const toronto: [number, number] = [43.6532, -79.3832];
  const nearby: [number, number] = [43.66, -79.38];

  it("encodeGeohash returns a non-empty string", () => {
    const hash = encodeGeohash(toronto[0], toronto[1]);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("distanceKm is zero for the same point", () => {
    expect(distanceKm(toronto, toronto)).toBe(0);
  });

  it("distanceKm is small for nearby points", () => {
    const d = distanceKm(toronto, nearby);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(5);
  });

  it("isWithinRadius respects radius", () => {
    expect(isWithinRadius(toronto, nearby, 10)).toBe(true);
    expect(isWithinRadius(toronto, nearby, 0.001)).toBe(false);
  });
});
