"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { getWaitlistFormUrl } from "@/lib/waitlist";
import { Countdown } from "@/components/Countdown";


function AddBarButton({ className = "" }: { className?: string }) {
  return (<></>);
  // const formUrl = getWaitlistFormUrl();

  // if (!formUrl) {
  //   return (
  //     <span
  //       className={`cursor-not-allowed rounded-xl bg-wc-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-wc-muted ${className}`}
  //     >
  //       Add Your Bar
  //     </span>
  //   );
  // }

  // return (
  //   <a
  //     href={formUrl}
  //     target="_blank"
  //     rel="noopener noreferrer"
  //     onClick={() => track("waitlist_click", { source: "header_add_bar" })}
  //     className={`rounded-xl bg-wc-neon px-4 py-2 text-sm font-bold uppercase tracking-wide text-wc-navy shadow-neon-sm transition hover:brightness-110 ${className}`}
  //   >
  //     Add Your Bar
  //   </a>
  // );
}

/** App header with logo, nav, and primary CTA */
export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-wc-border bg-wc-navy/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl" aria-hidden>
            ⚽
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg tracking-wider text-white sm:text-xl">
              TORONTO WORLD CUP BARS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-wc-gold sm:text-xs">
              2026
            </p>
          </div>
        </div>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
        </nav>

        <div className="flex items-center gap-2">
          <Countdown />
          <AddBarButton className="hidden sm:inline-flex" />

          <button
            type="button"
            className="rounded-lg p-2 text-wc-muted transition hover:bg-wc-card hover:text-white md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-wc-border bg-wc-surface px-4 py-3 md:hidden"
          aria-label="Mobile menu"
        >
          <ul className="space-y-2">
            <li className="pt-2">
              <AddBarButton className="inline-flex w-full justify-center" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
