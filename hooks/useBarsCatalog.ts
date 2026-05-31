"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import type { Bar } from "@/types/bar";

interface BarsApiResponse {
  bars: Bar[];
  meta: { total: number };
}

interface UseBarsCatalogResult {
  allBars: Bar[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Fetches the full bar catalog once per session and keeps it in memory.
 * Radius / filter changes do not trigger additional API or Firestore reads.
 */
export function useBarsCatalog(): UseBarsCatalogResult {
  const [allBars, setAllBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchGeneration, setFetchGeneration] = useState(0);

  const fetchedRef = useRef(false);

  const retry = useCallback(() => {
    fetchedRef.current = false;
    setError(null);
    setLoading(true);
    setFetchGeneration((n) => n + 1);
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/bars", { signal: controller.signal });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message =
            res.status === 429
              ? "Too many requests. Please wait a moment and try again."
              : (body.error ?? `HTTP ${res.status}`);
          throw new Error(message);
        }

        const data = body as BarsApiResponse;
        setAllBars(data.bars);
        track("catalog_loaded", { total_count: data.bars.length });
        setError(null);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        fetchedRef.current = false;
        setError(e instanceof Error ? e.message : "Failed to load bars");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [fetchGeneration]);

  return { allBars, loading, error, retry };
}
