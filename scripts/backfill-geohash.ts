/**
 * Adds or updates the `geohash` field on all existing `bars` documents.
 * Run once after enabling geospatial queries on an existing database.
 *
 *   npm run backfill-geohash
 */
import { config } from "dotenv";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { encodeGeohash } from "../lib/geospatial";

config({ path: resolve(process.cwd(), ".env.local") });

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase env vars in .env.local");
    process.exit(1);
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function backfill() {
  initAdmin();
  const db = getFirestore();
  const snapshot = await db.collection("bars").get();

  if (snapshot.empty) {
    console.log("No bars found. Run `npm run seed` first.");
    return;
  }

  console.log(`Backfilling geohash on ${snapshot.size} document(s)…\n`);

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const lat = data.lat as number;
    const lng = data.lng as number;

    if (typeof lat !== "number" || typeof lng !== "number") {
      console.warn(`  ⚠ Skipping ${doc.id}: missing lat/lng`);
      continue;
    }

    const geohash = encodeGeohash(lat, lng);
    await doc.ref.update({ geohash });
    console.log(`  ✓ ${data.name ?? doc.id} → ${geohash}`);
    updated++;
  }

  console.log(`\nUpdated ${updated} document(s).`);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
