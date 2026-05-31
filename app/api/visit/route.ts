import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { captureException } from "@/lib/monitoring";
import { recordVisitorHit, VISITOR_COOKIE } from "@/lib/visitorStats";

/**
 * POST /api/visit
 *
 * First-party unique visitor tracking (Firebase / Firestore).
 * Sets an httpOnly cookie with an anonymous id; no Firebase client SDK.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    const isFirstCookie = !visitorId;

    if (!visitorId) {
      visitorId = randomUUID();
    }

    const { isNewVisitor } = await recordVisitorHit(visitorId);

    const res = NextResponse.json({
      ok: true,
      new_visitor: isNewVisitor,
    });

    if (isFirstCookie) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    captureException(error, { route: "POST /api/visit" });
    const message =
      error instanceof Error ? error.message : "Failed to record visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
