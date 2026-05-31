import * as fs from "fs";
import * as path from "path";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── CSV parser (no external deps) ────────────────────────────────────────────

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? "").trim()]));
  });
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

// ── Field mappers ─────────────────────────────────────────────────────────────

/** Derive entry_type from the Reservations? column */
function mapEntryType(reservations: string): string {
  const val = reservations.toLowerCase();
  if (val === "no" || val === "no – first come, first served" || val === "no reservations for games") {
    return "Walk-in";
  }
  if (val.includes("walk-in friendly")) return "Walk-in friendly";
  if (val.includes("recommended")) return "Recommended reservation";
  if (val.includes("advance") || val === "yes (private events)") return "Reservation required";
  if (val.includes("group")) return "Reservations for groups";
  if (val.includes("bookable") || val === "yes for big matches") return "Bookable";
  return reservations; // fall back to raw value
}

/** Normalise the Cover? column into a clean cover_charge string */
function mapCoverCharge(cover: string): string {
  const val = cover.trim().toLowerCase();
  if (val === "no" || val === "no cover") return "No Cover";
  return cover.trim();
}

/** Derive a fan_hub label from the Ideal Fans column */
function mapFanHub(idealFans: string): string {
  return idealFans.trim() || "All fans";
}

/** Map Screens column to a human-readable audio_status.
 *  The CSV has no explicit audio field, so we infer from screen descriptions. */
function mapAudioStatus(screens: string): string {
  const val = screens.toLowerCase();
  if (val.includes("sound") || val.includes("audio") || val.includes("full")) return "Full Audio";
  if (val.includes("silent") || val.includes("muted")) return "Muted / Subtitles";
  // Most sports bars show audio — default to Full Audio
  return "Full Audio";
}

// ── Main ──────────────────────────────────────────────────────────────────────

function convert(csvPath: string, outputPath: string): void {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);

  const bars: BarEntry[] = rows.map((row) => ({
    name: row["Bar Name"],
    lat: parseFloat(row["Latitude"]),
    lng: parseFloat(row["Longitude"]),
    is_streaming_wc: true, // every bar in this list is showing the World Cup
    entry_type: mapEntryType(row["Reservations?"]),
    cover_charge: mapCoverCharge(row["Cover?"]),
    fan_hub: mapFanHub(row["Ideal Fans"]),
    vibe_notes: row["Vibe"] || "",
    audio_status: mapAudioStatus(row["Screens"]),
  }));

  fs.writeFileSync(outputPath, JSON.stringify(bars, null, 2), "utf-8");
  console.log(`✅  Converted ${bars.length} bars → ${path.resolve(outputPath)}`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const CSV_PATH = process.argv[2] ?? "Bars_showing_Fifa_World_Cup_with_coords.csv";
const OUTPUT_PATH = process.argv[3] ?? "bars.json";

convert(CSV_PATH, OUTPUT_PATH);
