"use client";

export type MobileView = "list" | "map";

interface MobileBottomNavProps {
  activeView: MobileView;
  onViewChange: (view: MobileView) => void;
}

const TABS: { id: MobileView; label: string; icon: string }[] = [
  { id: "list", label: "Explore", icon: "☰" },
  { id: "map", label: "Map", icon: "🗺" },
];

/** Bottom navigation for mobile — toggles list vs map */
export function MobileBottomNav({
  activeView,
  onViewChange,
}: MobileBottomNavProps) {
  return (
    <nav
      className="flex shrink-0 border-t border-wc-border bg-wc-surface md:hidden"
      aria-label="Mobile navigation"
    >
      {TABS.map(({ id, label, icon }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition ${
              active
                ? "text-wc-neon"
                : "text-wc-muted hover:text-white"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            <span className="font-medium uppercase tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
