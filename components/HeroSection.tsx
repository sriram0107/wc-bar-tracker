import Image from "next/image";
import { WaitlistWidget } from "@/components/WaitlistWidget";
import { getHeroImageUrl } from "@/lib/images";

/** Hero banner with Toronto skyline photo, tagline, and waitlist widget */
export function HeroSection() {
  const heroImage = getHeroImageUrl();

  return (
    <section className="relative min-h-[220px] shrink-0 overflow-hidden px-4 py-6 md:min-h-[280px] md:px-6 md:py-10">
      <Image
        src={heroImage}
        alt="Toronto skyline at night"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-wc-navy/95 via-wc-navy/80 to-wc-navy/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-wc-navy via-transparent to-wc-navy/40" />

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -right-20 top-0 h-40 w-40 rounded-full bg-wc-purple/40 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-wc-neon/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="font-display text-sm tracking-[0.3em] text-wc-gold text-glow-gold">
            TORONTO · 2026
          </p>
          <h2 className="mt-2 font-display text-4xl leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            LIVE THE GAME.
            <br />
            <span className="text-wc-neon text-glow-neon">FEEL THE CITY.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-wc-muted md:text-base">
            Find the best bars to watch World Cup matches — filter by cover,
            audio, and walk-in access across Toronto.
          </p>
          <p className="mt-4 text-[10px] text-wc-muted/70">
            Photo by{" "}
            <a
              href="https://unsplash.com/@shotbymax"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-wc-muted"
            >
              Max
            </a>{" "}
            on{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-wc-muted"
            >
              Unsplash
            </a>
          </p>
        </div>

        <WaitlistWidget />
      </div>
    </section>
  );
}
