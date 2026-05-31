import { parseClientEnv } from "@/lib/env";

const UTM_PARAMS =
  "utm_source=wc-bar-tracker&utm_medium=header&utm_campaign=waitlist";

/**
 * Returns the waitlist Google Form URL with UTM params for attribution.
 * Only HTTPS URLs are accepted (validated via env schema).
 */
export function getWaitlistFormUrl(): string | null {
  const parsed = parseClientEnv();
  const base = parsed.success
    ? parsed.data.NEXT_PUBLIC_WAITLIST_FORM_URL
    : process.env.NEXT_PUBLIC_WAITLIST_FORM_URL;

  if (!base || !base.startsWith("https://")) return null;

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${UTM_PARAMS}`;
}
