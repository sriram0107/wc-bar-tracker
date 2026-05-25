const UTM_PARAMS =
  "utm_source=wc-bar-tracker&utm_medium=header&utm_campaign=waitlist";

/**
 * Returns the waitlist Google Form URL with UTM params for attribution.
 */
export function getWaitlistFormUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL;
  if (!base) return null;

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${UTM_PARAMS}`;
}
