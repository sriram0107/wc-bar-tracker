"use client";

import { useEffect, useRef } from "react";

/**
 * Records one visit per browser via POST /api/visit (Firestore + anonymous cookie).
 * Enable with VISITOR_TRACKING=firebase or both (see README).
 */
export function VisitorBeacon() {
  const sent = useRef(false);

  useEffect(() => {
    const mode = process.env.NEXT_PUBLIC_VISITOR_TRACKING ?? "firebase";
    if (mode === "vercel") return;
    if (sent.current) return;
    sent.current = true;

    fetch("/api/visit", { method: "POST", credentials: "include" }).catch(
      () => {
        // Non-blocking — map and bars still work if stats fail
      }
    );
  }, []);

  return null;
}
