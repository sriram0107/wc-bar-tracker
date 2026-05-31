"use client";

import { track } from "@/lib/analytics";
import { getWaitlistFormUrl } from "@/lib/waitlist";

/** Sidebar CTA for bar owners to get listed */
export function BarOwnerCTA() {
  const formUrl = getWaitlistFormUrl();

  const handleClick = () => {
    track("waitlist_click", { source: "bar_owner_cta" });
  };

  return (
    <div className="shrink-0 rounded-2xl border border-wc-purple/40 bg-gradient-to-br from-wc-purple/20 to-wc-card p-4">
      <p className="font-display text-base tracking-wider text-wc-purple-light">
        OWN OR KNOW A BAR?
      </p>
      <p className="mt-1 text-sm text-wc-muted">
        Help us list it here!
      </p>
      {formUrl ? (
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="mt-3 inline-flex rounded-xl bg-wc-neon px-4 py-2 text-sm font-bold uppercase tracking-wide text-wc-navy shadow-neon-sm transition hover:brightness-110"
        >
          Add Your Bar
        </a>
      ) : (
        <span className="mt-3 inline-flex cursor-not-allowed rounded-xl bg-wc-border px-4 py-2 text-sm font-medium text-wc-muted">
          Add Your Bar
        </span>
      )}
    </div>
  );
}
