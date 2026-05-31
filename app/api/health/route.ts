import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

/**
 * GET /api/health
 * Liveness probe — always returns 200 if the app is running.
 * Optional ?db=1 checks Firestore connectivity (for readiness probes).
 */
export async function GET(request: Request) {
  const checkDb = new URL(request.url).searchParams.get("db") === "1";

  if (!checkDb) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  try {
    const db = getAdminFirestore();
    await db.collection("bars").limit(1).get();
    return NextResponse.json({ status: "ok", firestore: "connected" });
  } catch (error) {
    console.error("[GET /api/health]", error);
    return NextResponse.json(
      { status: "error", firestore: "disconnected" },
      { status: 503 }
    );
  }
}
