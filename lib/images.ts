/**
 * Curated Unsplash CDN URLs (free license — https://unsplash.com/license).
 * Unsplash requires hotlinking via their CDN rather than self-hosting copies.
 */

const UNSPLASH_BASE = "https://images.unsplash.com";

/** Build a sized Unsplash image URL from a photo slug (e.g. photo-1759431378921-9fb518513d30). */
export function unsplashUrl(
  photoId: string,
  opts: { width: number; height?: number; quality?: number } = { width: 800 }
): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(opts.width),
    q: String(opts.quality ?? 80),
  });
  if (opts.height) params.set("h", String(opts.height));
  return `${UNSPLASH_BASE}/${photoId}?${params}`;
}

/** Toronto skyline at night (CN Tower) — Max (@shotbymax) */
export const HERO_TORONTO_PHOTO = "photo-1759431378921-9fb518513d30";

/** Soccer fans celebrating — footer background */
export const FOOTER_CROWD_PHOTO = "photo-1522778119026-d647f0596c20";

/** Sports bars, pubs, and watch-party scenes for card thumbnails */
export const BAR_THUMBNAIL_PHOTOS = [
  "photo-1671368913134-c211bc02487f", // bar watching TV
  "photo-1514933651103-005eec06c04b", // pub interior
  "photo-1572116469696-31de0f17cc34", // bar scene
  "photo-1551958219-acbc608c6377", // football on screen
  "photo-1516450360452-9312f5e86fc7", // nightlife bar
  "photo-1470337458703-46ad1756a187", // cocktails at bar
  "photo-1414235077428-338989a2e8c0", // restaurant/bar
  "photo-1551218808-94e220e084d2", // drinks at bar
  "photo-1601925260368-ae2f83cf8b7f", // sports viewing
  "photo-1431324155629-1a6deb1dec8d", // stadium crowd
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic thumbnail per bar — stable across reloads */
export function getBarImageUrl(barId: string, barName?: string): string {
  const key = barId || barName || "default";
  const index = hashString(key) % BAR_THUMBNAIL_PHOTOS.length;
  return unsplashUrl(BAR_THUMBNAIL_PHOTOS[index], { width: 200, height: 200 });
}

export function getHeroImageUrl(): string {
  return unsplashUrl(HERO_TORONTO_PHOTO, { width: 1920, quality: 85 });
}

export function getFooterCrowdImageUrl(): string {
  return unsplashUrl(FOOTER_CROWD_PHOTO, { width: 1600, quality: 75 });
}
