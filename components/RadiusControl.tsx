"use client";

interface RadiusControlProps {
  radiusKm: number;
  onChange: (radiusKm: number) => void;
  min?: number;
  max?: number;
}

/** Slider to adjust the geospatial search radius (kilometres) */
export function RadiusControl({
  radiusKm,
  onChange,
  min = 1,
  max = 50,
}: RadiusControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium uppercase tracking-wide text-wc-muted">
          Search radius
        </span>
        <span className="tabular-nums font-bold text-wc-neon">
          {radiusKm} km
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={radiusKm}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        aria-label="Search radius in kilometres"
      />
      <div className="flex justify-between text-[10px] text-wc-muted">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  );
}
