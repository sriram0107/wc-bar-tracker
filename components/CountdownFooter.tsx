"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getFooterCrowdImageUrl } from "@/lib/images";

const KICKOFF = new Date("2026-06-11T16:00:00-04:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = KICKOFF.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl tabular-nums text-wc-neon text-glow-neon sm:text-3xl md:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-widest text-wc-muted sm:text-xs">
        {label}
      </span>
    </div>
  );
}

/** Countdown to FIFA World Cup 2026 kickoff */
export function CountdownFooter() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const crowdImage = getFooterCrowdImageUrl();

  useEffect(() => {
    setTimeLeft(calcTimeLeft());
    const id = window.setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="relative min-h-[120px] shrink-0 overflow-hidden border-t border-wc-border">
      <Image
        src={crowdImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-wc-navy/88" />

      <div className="relative px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-display text-sm tracking-[0.25em] text-wc-gold">
              COUNTDOWN TO KICKOFF
            </p>
            <p className="mt-1 text-xs text-wc-muted sm:text-sm">
              World Cup 2026 · June 11 – July 19
            </p>
          </div>

          {timeLeft ? (
            <div className="flex gap-4 sm:gap-6">
              <Unit value={timeLeft.days} label="Days" />
              <span className="font-display text-2xl text-wc-border">:</span>
              <Unit value={timeLeft.hours} label="Hours" />
              <span className="font-display text-2xl text-wc-border">:</span>
              <Unit value={timeLeft.minutes} label="Min" />
              <span className="font-display text-2xl text-wc-border">:</span>
              <Unit value={timeLeft.seconds} label="Sec" />
            </div>
          ) : (
            <div className="h-10 w-48 animate-pulse rounded-lg bg-wc-border" />
          )}

          <span className="text-3xl" aria-hidden>
            🏆
          </span>
        </div>
      </div>
    </footer>
  );
}
