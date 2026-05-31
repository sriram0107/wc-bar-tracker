"use client";

import Image from "next/image";
import { useState } from "react";
import { getBarImageUrl } from "@/lib/images";

interface BarThumbnailProps {
  barId: string;
  barName: string;
  /** Optional override from Firestore */
  imageUrl?: string;
  className?: string;
}

function barInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Bar card thumbnail — Unsplash photo with initials fallback */
export function BarThumbnail({
  barId,
  barName,
  imageUrl,
  className = "h-16 w-16",
}: BarThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl ?? getBarImageUrl(barId, barName);

  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wc-purple/40 to-wc-neon/20 font-display text-xl text-wc-neon ${className}`}
        aria-hidden
      >
        {barInitials(barName)}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-wc-navy/40 to-transparent" />
    </div>
  );
}
