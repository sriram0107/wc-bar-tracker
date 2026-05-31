import { describe, expect, it } from "vitest";
import {
  BAR_THUMBNAIL_PHOTOS,
  getBarImageUrl,
  unsplashUrl,
} from "@/lib/images";

describe("images", () => {
  it("builds unsplash URLs with width and height", () => {
    const url = unsplashUrl("photo-123", { width: 400, height: 200 });
    expect(url).toContain("images.unsplash.com/photo-123");
    expect(url).toContain("w=400");
    expect(url).toContain("h=200");
  });

  it("returns stable bar thumbnails for the same id", () => {
    const a = getBarImageUrl("bar-42");
    const b = getBarImageUrl("bar-42");
    expect(a).toBe(b);
    expect(BAR_THUMBNAIL_PHOTOS.some((id) => a.includes(id))).toBe(true);
  });

  it("can assign different thumbnails to different bars", () => {
    const urls = new Set([
      getBarImageUrl("bar-1"),
      getBarImageUrl("bar-2"),
      getBarImageUrl("bar-3"),
      getBarImageUrl("bar-4"),
      getBarImageUrl("bar-5"),
    ]);
    expect(urls.size).toBeGreaterThan(1);
  });
});
