"use client";

import { Analytics } from "@vercel/analytics/react";

/**
 * Vercel Web Analytics — unique visitors in the Vercel project dashboard.
 * Enable with NEXT_PUBLIC_VISITOR_TRACKING=vercel or both.
 */
export function VercelAnalytics() {
  const mode = process.env.NEXT_PUBLIC_VISITOR_TRACKING ?? "firebase";
  if (mode === "firebase") return null;

  return <Analytics />;
}
