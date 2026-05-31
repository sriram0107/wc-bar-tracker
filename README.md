# World Cup Bar Tracker — Toronto MVP

A curated directory of Toronto bars showing the World Cup. Browse a Mapbox map, search within an adjustable radius around your location, filter by walk-in / cover / audio, and read hand-curated vibe notes. The frontend fetches the bar catalog **once per session** and filters client-side to minimize Firestore reads.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS, `react-map-gl` |
| API | `app/api/bars` — single Firestore read; client-side radius + filters |
| Database | Firebase Firestore (`bars` collection) |
| Auth pattern | `firebase-admin` on server only; no client Firebase SDK |

## Prerequisites

- Node.js **18.18+** or **20+** (required by Next.js 15)
- A [Firebase](https://console.firebase.google.com/) project with Firestore enabled
- A [Mapbox](https://account.mapbox.com/) public access token

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

1. **Firebase Admin** — In Firebase Console → Project Settings → Service Accounts → *Generate new private key*. Copy `project_id`, `client_email`, and `private_key` into the three `FIREBASE_*` variables. For `FIREBASE_PRIVATE_KEY`, keep the value in double quotes with `\n` for newlines (as in the example file).

2. **Mapbox** — Create a public token at [mapbox.com](https://account.mapbox.com/access-tokens/) and set `NEXT_PUBLIC_MAPBOX_TOKEN`.

3. **Plausible Analytics** (optional) — Add your site at [plausible.io](https://plausible.io) and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to the same hostname (e.g. your production domain or ngrok URL).

4. **Waitlist CTA** (optional) — Set `NEXT_PUBLIC_WAITLIST_FORM_URL` to your Google Form link. The header **Join waitlist** button opens it in a new tab.

### 3. Seed mock data (optional)

Populates **50** test bars across Toronto neighbourhoods (with geohash fields):

```bash
npm run seed
```

Re-seed from scratch (deletes existing `bars` documents first):

```bash
npm run seed -- --clear
```

### 4. Backfill geohash (existing data only)

If you already have bars in Firestore without a `geohash` field:

```bash
npm run backfill-geohash
```

When adding bars manually in the Firebase Console, set `geohash` using the same encoding as `geofire-common` (or re-run the backfill script after setting `lat`/`lng`).

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow location when prompted; adjust the **Search radius** slider (default 10 km, up to 50 km).

## Analytics and waitlist

### Unique visitors (Firebase or Vercel — pick one)

Set `NEXT_PUBLIC_VISITOR_TRACKING` in `.env.local`:

| Value | How it works | Where to see the count |
|-------|----------------|------------------------|
| `firebase` (default) | Anonymous `wc_vid` cookie + `POST /api/visit` writes to Firestore | `GET /api/stats/visitors` or Firebase Console → `meta/site_stats` |
| `vercel` | [@vercel/analytics](https://vercel.com/docs/analytics) in the layout | Vercel project → **Analytics** (enable Web Analytics in project settings) |
| `both` | Firestore beacon + Vercel Analytics | Both places above |

**Firebase schema (no client Firebase SDK):**

- `meta/site_stats` — `unique_visitors`, `total_visits`, `updated_at`
- `visitors/{anonymousId}` — `first_seen`, `last_seen`, `visit_count`

**Read count programmatically:**

```bash
curl http://localhost:3000/api/stats/visitors
# Optional: curl -H "x-stats-secret: YOUR_SECRET" ...
```

Plausible (below) is still used for **engagement events** (waitlist clicks, filters, etc.), not for unique visitor totals.

### Plausible setup (engagement events)

1. Create a site at [plausible.io](https://plausible.io) matching your deployed hostname.
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in `.env.local`.
3. In Plausible → **Site settings** → **Goals**, add a custom event goal named `waitlist_click` to track waitlist conversion.

Pageviews are automatic. Custom events are sent via `lib/analytics.ts` (no PII — no coordinates or emails).

| Event | When it fires | What it tells you |
|-------|----------------|-------------------|
| `location_granted` | User allows geolocation | How many users search near themselves |
| `location_denied` | Permission denied or fallback | Friction in the location flow |
| `catalog_loaded` | Full catalog fetched once | Total bars (`total_count`) |
| `search_completed` | Radius/location filter applied (client) | Results in view (`radius_km`, `result_count`) |
| `radius_changed` | Radius slider moved | How users tune their search area |
| `filter_toggled` | Filter pill clicked | Which filters matter (`filter`, `enabled`) |
| `bar_selected` | Bar card or map marker clicked | Deep engagement (`bar_id`) |
| `waitlist_click` | **Join waitlist** header CTA | Funnel to your main product idea |

### Waitlist button

The header **Join waitlist →** link uses `NEXT_PUBLIC_WAITLIST_FORM_URL` and appends UTM parameters (`utm_source=wc-bar-tracker`, etc.) for attribution in Google Forms / Sheets.

## Data loading and geospatial filter

**One Firestore read per session:** `GET /api/bars` returns every bar with `is_streaming_wc == true` (~50 documents). The client caches this in memory via [`hooks/useBarsCatalog.ts`](hooks/useBarsCatalog.ts).

**Client-side only (no extra DB reads):**

- **Radius** — haversine distance from your location vs. the slider value (1–50 km).
- **Filters** — walk-in, no cover, game audio pills.

Each bar still stores a `geohash` field (for seeding / future server-side queries). The map shows a green circle for your search radius and `distance_km` on each result.

## Firestore schema (`bars` collection)

| Field | Type | Example |
|-------|------|---------|
| `name` | string | `"The Football Factory"` |
| `lat` | number | `43.6487` |
| `lng` | number | `-79.4025` |
| `geohash` | string | `"dpz83f"` (for seeding; optional for client-only filter) |
| `is_streaming_wc` | boolean | `true` |
| `entry_type` | string | `"Walk-in"` \| `"Reservation"` \| `"Ticketed"` |
| `cover_charge` | string | `"No Cover"`, `"$10"` |
| `fan_hub` | string | `"Croatia"`, `"None"` |
| `vibe_notes` | string | Curated description |
| `audio_status` | string | `"Full Audio"` \| `"Visual Only"` |

## Project structure

```
app/
  api/bars/route.ts    # GET — full catalog (one Firestore read)
  page.tsx             # Client-side radius + filters
hooks/
  useBarsCatalog.ts    # Fetch-once session cache
components/
  AppHeader.tsx        # Title + waitlist CTA
  BarCard.tsx
  BarMap.tsx           # Radius circle overlay + markers
  FilterPills.tsx
  PlausibleAnalytics.tsx
  RadiusControl.tsx    # 1–50 km slider
  WaitlistButton.tsx
lib/
  analytics.ts         # Plausible track() helper
  firebaseAdmin.ts
  geospatial.ts        # geohash encode + Firestore geo query
  geojsonCircle.ts     # Map radius polygon
  waitlist.ts          # Form URL + UTM params
  visitorStats.ts      # Firestore unique visitor aggregates
app/api/
  visit/route.ts       # POST — record anonymous visit
  stats/visitors/route.ts
components/
  VisitorBeacon.tsx
  VercelAnalytics.tsx
scripts/
  seed-bars.ts
  backfill-geohash.ts
```

## API

### `GET /api/bars`

No query parameters. Returns the full streaming catalog in one request.

**Response:**

```json
{
  "bars": [
    {
      "id": "abc123",
      "name": "The Football Factory",
      "lat": 43.6487,
      "lng": -79.4025,
      "geohash": "dpz83f7",
      "is_streaming_wc": true,
      "entry_type": "Walk-in",
      "cover_charge": "No Cover",
      "fan_hub": "England",
      "vibe_notes": "...",
      "audio_status": "Full Audio"
    }
  ],
  "meta": { "total": 50 }
}
```

`distance_km` is computed on the client when filtering by radius.

## Filters (client-side)

Applied on top of the geo query result:

| Pill | Filters on |
|------|------------|
| Walk-ins Only | `entry_type === "Walk-in"` |
| No Cover | `cover_charge === "No Cover"` |
| Game Audio | `audio_status === "Full Audio"` |

## Production build

```bash
npm run build
npm start
```

Set the same environment variables on your host (Vercel, etc.).

### Firestore security rules

Client SDK access to `bars` is denied in [`firestore.rules`](firestore.rules). The Next.js API uses Firebase Admin (bypasses rules). Deploy rules to your project:

```bash
firebase deploy --only firestore:rules
```

### Health check

- `GET /api/health` — liveness
- `GET /api/health?db=1` — readiness (Firestore ping)

### CI

GitHub Actions runs `lint`, `test`, and `build` on push/PR (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Editing data

Your cofounder can add or update bars in the [Firebase Console](https://console.firebase.google.com/) → Firestore → `bars`. After adding `lat`/`lng`, run `npm run backfill-geohash` to set `geohash`, or include `geohash` when creating the document.

## License

Private MVP — all rights reserved.
