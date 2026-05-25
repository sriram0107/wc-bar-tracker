/**
 * Seeds ~50 mock Toronto bars into Firestore for local UI testing.
 * Each document includes a `geohash` field for geospatial queries.
 *
 * Usage:
 *   cp .env.local.example .env.local
 *   npm run seed              # add bars (skips if collection already has docs)
 *   npm run seed -- --clear   # delete all bars first, then seed fresh
 */
import { config } from "dotenv";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { encodeGeohash } from "../lib/geospatial";
import { SEED_BARS } from "./seed-bars-data";

config({ path: resolve(process.cwd(), ".env.local") });

const BATCH_SIZE = 500; // Firestore batch limit

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing env vars. Copy .env.local.example → .env.local and add Firebase Admin credentials."
    );
    process.exit(1);
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function clearBars(db: FirebaseFirestore.Firestore) {
  const snapshot = await db.collection("bars").get();
  if (snapshot.empty) return 0;

  let deleted = 0;
  let batch = db.batch();
  let ops = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    ops++;
    deleted++;
    if (ops >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
  return deleted;
}

async function seed() {
  const shouldClear = process.argv.includes("--clear");
  initAdmin();
  const db = getFirestore();

  if (shouldClear) {
    const removed = await clearBars(db);
    console.log(`Cleared ${removed} existing bar(s).\n`);
  } else {
    const existing = await db.collection("bars").limit(1).get();
    if (!existing.empty) {
      console.log(
        "Bars collection already has documents. Run with --clear to wipe and re-seed:\n  npm run seed -- --clear\n"
      );
      process.exit(0);
    }
  }

  console.log(`Seeding ${SEED_BARS.length} Toronto bars (with geohash)…\n`);

  let batch = db.batch();
  let ops = 0;
  let written = 0;

  for (const bar of SEED_BARS) {
    const geohash = encodeGeohash(bar.lat, bar.lng);
    const ref = db.collection("bars").doc();
    batch.set(ref, { ...bar, geohash });
    ops++;
    written++;

    if (ops >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();

  console.log(`✓ Wrote ${written} bars to Firestore.\n`);
  console.log("Start the app: npm run dev → http://localhost:3000");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
