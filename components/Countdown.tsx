"use client";

import { useEffect, useState } from "react";

/** June 11 2026 @ 15:00 Eastern (EDT = UTC-4) → 19:00 UTC */
const KICKOFF = new Date("2026-06-11T19:00:00Z");

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(): TimeLeft | null {
    const diff = KICKOFF.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
    };
}

function Unit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span
                className="font-display tabular-nums leading-none text-wc-neon"
                style={{
                    fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 12px rgba(0,255,163,0.7), 0 0 30px rgba(0,255,163,0.3)",
                }}
            >
                {String(value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.2em] text-wc-muted">
                {label}
            </span>
        </div>
    );
}

function Colon() {
    return (
        <span
            className="mb-3 font-display font-black text-wc-purple-light"
            style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)", lineHeight: 1 }}
        >
            :
        </span>
    );
}

/** Loud, bold countdown to World Cup kickoff — top-right of the header */
export function Countdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(getTimeLeft);

    useEffect(() => {
        const id = setInterval(() => setTimeLeft(getTimeLeft()), 1_000);
        return () => clearInterval(id);
    }, []);

    if (!timeLeft) {
        return (
            <div
                className="font-display font-black uppercase tracking-widest text-wc-gold"
                style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)", textShadow: "0 0 10px rgba(255,199,0,0.6)" }}
            >
                {"IT'S HAPPENING ⚽"}
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-1 rounded-xl px-3 py-1.5"
            style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(0,255,163,0.08) 100%)",
                border: "1px solid rgba(0,255,163,0.25)",
                boxShadow: "0 0 20px rgba(0,255,163,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
        >
            <span
                className="mr-1.5 hidden font-display font-black uppercase tracking-[0.18em] text-wc-muted sm:block"
                style={{ fontSize: "clamp(0.55rem, 1vw, 0.65rem)" }}
            >
                Kickoff
            </span>
            <Unit value={timeLeft.days} label="days" />
            <Colon />
            <Unit value={timeLeft.hours} label="hrs" />
            <Colon />
            <Unit value={timeLeft.minutes} label="min" />
            <Colon />
            <Unit value={timeLeft.seconds} label="sec" />
        </div>
    );
}
