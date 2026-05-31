"use client";

import { track } from "@/lib/analytics";
import { getWaitlistFormUrl } from "@/lib/waitlist";

/** Hero waitlist card — opens Google Form in a new tab */
export function WaitlistWidget() {
  const formUrl = getWaitlistFormUrl();

  const handleClick = () => {
    track("waitlist_click", { source: "hero" });
  };

  return (
    <div className="w-full shrink-0 rounded-2xl border border-wc-border bg-wc-card/80 p-5 backdrop-blur-sm lg:max-w-sm">
      <p className="font-display text-lg tracking-wider text-wc-purple-light">
        MORE THAN WORLD CUP
      </p>
      <p className="mt-1 text-sm text-wc-muted">
        Get alerts for match-day specials, fan hubs, and new bar listings.
      </p>

      {formUrl ? (
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-wc-purple px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-purple transition hover:bg-wc-purple-light"
        >
          Join Waitlist
        </a>
      ) : (
        <span
          className="mt-4 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-wc-border px-4 py-3 text-sm font-medium text-wc-muted"
          title="Set NEXT_PUBLIC_WAITLIST_FORM_URL in .env.local"
        >
          Waitlist coming soon
        </span>
      )}
    </div>
  );
}
