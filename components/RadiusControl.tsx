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
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium text-gray-700">Search radius</span>
        <span className="tabular-nums font-semibold text-pitch-700">
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
        className="h-2 w-full cursor-pointer accent-pitch-600"
        aria-label="Search radius in kilometres"
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  );
}
