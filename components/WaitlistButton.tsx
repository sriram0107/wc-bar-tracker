"use client";

import { track } from "@/lib/analytics";
import { getWaitlistFormUrl } from "@/lib/waitlist";

/**
 * Header CTA — opens the waitlist Google Form in a new tab and tracks the click.
 */
export function WaitlistButton() {
  const formUrl = getWaitlistFormUrl();

  if (!formUrl) {
    return (
      <span
        className="cursor-not-allowed rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white/60"
        title="Set NEXT_PUBLIC_WAITLIST_FORM_URL in .env.local"
      >
        Join waitlist
      </span>
    );
  }

  return (
    <a
      href={formUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("waitlist_click", { source: "header" })}
      className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-pitch-700 shadow-sm transition hover:bg-pitch-50"
    >
      Join waitlist →
    </a>
  );
}
