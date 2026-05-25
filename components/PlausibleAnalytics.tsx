"use client";

import Script from "next/script";

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Loads the Plausible analytics script when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 * Pageviews are tracked automatically; use track() from lib/analytics for custom events.
 */
export function PlausibleAnalytics() {
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
