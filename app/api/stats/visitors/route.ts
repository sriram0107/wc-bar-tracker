import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@/lib/monitoring";
import { getSiteVisitorStats } from "@/lib/visitorStats";

/**
 * GET /api/stats/visitors
 *
 * Unique visitor count from Firestore (meta/site_stats).
 * Optional: STATS_READ_SECRET + header x-stats-secret to restrict access.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.STATS_READ_SECRET;
  if (secret) {
    const provided = request.headers.get("x-stats-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const stats = await getSiteVisitorStats();
    return NextResponse.json(
      {
        source: "firebase",
        uniqueVisitors: stats.uniqueVisitors,
        totalVisits: stats.totalVisits,
        updatedAt: stats.updatedAt,
      },
      {
        headers: { "Cache-Control": "private, max-age=60" },
      }
    );
  } catch (error) {
    captureException(error, { route: "GET /api/stats/visitors" });
    const message =
      error instanceof Error ? error.message : "Failed to fetch visitor stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
