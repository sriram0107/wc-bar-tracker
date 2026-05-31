"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/monitoring";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-wc-navy p-6 text-center">
      <h1 className="font-display text-2xl tracking-wide text-white">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-wc-muted">
        We hit an unexpected error. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-xl bg-wc-neon px-4 py-2 text-sm font-bold uppercase tracking-wide text-wc-navy hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}
