import { NextResponse } from "next/server";
import { getClientErrorMessage, logApiError } from "@/lib/apiError";
import { captureException } from "@/lib/monitoring";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { fetchAllStreamingBars } from "@/lib/geospatial";

/**
 * GET /api/bars
 *
 * Returns all World Cup streaming bars in one Firestore read.
 * The client caches this payload and applies radius + filter logic locally.
 */
export async function GET() {
  try {
    const db = getAdminFirestore();
    const bars = await fetchAllStreamingBars(db);

    return NextResponse.json(
      {
        bars,
        meta: { total: bars.length },
      },
      {
        status: 200,
        headers: {
          // Safe to cache — catalog changes infrequently; client holds session copy
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    logApiError("GET /api/bars", error);
    captureException(error, { route: "GET /api/bars" });
    return NextResponse.json(
      { error: getClientErrorMessage(error) },
      { status: 500 }
    );
  }
}
