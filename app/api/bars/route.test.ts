import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/bars/route";

vi.mock("@/lib/firebaseAdmin", () => ({
  getAdminFirestore: vi.fn(() => ({})),
}));

vi.mock("@/lib/geospatial", () => ({
  fetchAllStreamingBars: vi.fn(),
}));

import { fetchAllStreamingBars } from "@/lib/geospatial";

const mockBar = {
  id: "1",
  name: "Test",
  lat: 43.65,
  lng: -79.38,
  geohash: "dpz83f7",
  is_streaming_wc: true as const,
  entry_type: "Walk-in" as const,
  cover_charge: "No Cover",
  fan_hub: "None",
  vibe_notes: "Notes",
  audio_status: "Full Audio" as const,
};

describe("GET /api/bars", () => {
  beforeEach(() => {
    vi.mocked(fetchAllStreamingBars).mockReset();
  });

  it("returns bars and meta on success", async () => {
    vi.mocked(fetchAllStreamingBars).mockResolvedValue([mockBar]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.bars).toHaveLength(1);
    expect(body.meta.total).toBe(1);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=300");
  });

  it("returns generic error in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    vi.mocked(fetchAllStreamingBars).mockRejectedValue(
      new Error("Missing Firebase Admin credentials")
    );

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");

    vi.unstubAllEnvs();
  });
});
