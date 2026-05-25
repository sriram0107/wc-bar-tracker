/** Plausible custom event props (no PII — no lat/lng, emails, etc.) */
export type AnalyticsProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: AnalyticsProps }
    ) => void;
  }
}

/**
 * Fire a Plausible custom event. No-ops when Plausible is not loaded.
 * In development, logs to console when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is unset.
 */
export function track(event: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;

  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props ?? {});
  }
}
