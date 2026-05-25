"use client";

import { useEffect, useRef, useState } from "react";
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
}

/**
 * Fetches the full bar catalog once per session and keeps it in memory.
 * Radius / filter changes do not trigger additional API or Firestore reads.
 */
export function useBarsCatalog(): UseBarsCatalogResult {
  const [allBars, setAllBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/bars", { signal: controller.signal });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = body as BarsApiResponse;
        setAllBars(data.bars);
        track("catalog_loaded", { total_count: data.bars.length });
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
  }, []);

  return { allBars, loading, error };
}
