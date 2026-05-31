/**
 * Seeds bars from the CSV file into Firestore using the csv_to_bars parser.
 * Each document includes a `geohash` field for geospatial queries.
 *
 * Usage:
 *   cp .env.local.example .env.local
 *   npm run seed                          # add bars (skips if collection already has docs)
 *   npm run seed -- --clear               # delete all bars first, then seed fresh
 *   npm run seed -- --csv path/to/file.csv  # use a custom CSV file
 */
import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { encodeGeohash } from "../lib/geospatial";

// ── Re-use the CSV parsing logic from csv_to_bars ────────────────────────────

interface BarEntry {
  name: string;
  lat: number;
  lng: number;
  is_streaming_wc: boolean;
  entry_type: string;
  cover_charge: string;
  fan_hub: string;
  vibe_notes: string;
  audio_status: string;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? "").trim()]));
  });
}

function mapEntryType(reservations: string): string {
  const val = reservations.toLowerCase();
  if (val === "no" || val === "no – first come, first served" || val === "no reservations for games") return "Walk-in";
  if (val.includes("walk-in friendly")) return "Walk-in friendly";
  if (val.includes("recommended")) return "Recommended reservation";
  if (val.includes("advance") || val === "yes (private events)") return "Reservation required";
  if (val.includes("group")) return "Reservations for groups";
  if (val.includes("bookable") || val === "yes for big matches") return "Bookable";
  return reservations;
}

function mapCoverCharge(cover: string): string {
  const val = cover.trim().toLowerCase();
  if (val === "no" || val === "no cover") return "No Cover";
  return cover.trim();
}

function mapFanHub(idealFans: string): string {
  return idealFans.trim() || "All fans";
}

function mapAudioStatus(screens: string): string {
  const val = screens.toLowerCase();
  if (val.includes("sound") || val.includes("audio") || val.includes("full")) return "Full Audio";
  if (val.includes("silent") || val.includes("muted")) return "Muted / Subtitles";
  return "Full Audio";
}

function loadBarsFromCSV(csvPath: string): BarEntry[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  return rows
    .filter((row) => row["Bar Name"] && row["Latitude"] && row["Longitude"])
    .map((row) => ({
      name: row["Bar Name"],
      lat: parseFloat(row["Latitude"]),
      lng: parseFloat(row["Longitude"]),
      is_streaming_wc: true,
      entry_type: mapEntryType(row["Reservations?"] ?? ""),
      cover_charge: mapCoverCharge(row["Cover?"] ?? ""),
      fan_hub: mapFanHub(row["Ideal Fans"] ?? ""),
      vibe_notes: row["Vibe"] || "",
      audio_status: mapAudioStatus(row["Screens"] ?? ""),
    }));
}

// ── Firebase helpers ─────────────────────────────────────────────────────────

config({ path: resolve(process.cwd(), ".env.local") });

const BATCH_SIZE = 500;

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

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
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

// ── Entry point ───────────────────────────────────────────────────────────────

async function seed() {
  const shouldClear = process.argv.includes("--clear");

  // Allow overriding the CSV path via --csv <path>
  const csvFlagIdx = process.argv.indexOf("--csv");
  const csvPath = csvFlagIdx !== -1
    ? resolve(process.argv[csvFlagIdx + 1])
    : resolve(__dirname, "Bars_showing_Fifa_World_Cup_with_coords.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

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

  const bars = loadBarsFromCSV(csvPath);
  console.log(`Seeding ${bars.length} bars from CSV (with geohash)…\n`);

  let batch = db.batch();
  let ops = 0;
  let written = 0;

  for (const bar of bars) {
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
