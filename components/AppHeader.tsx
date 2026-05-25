import { WaitlistButton } from "@/components/WaitlistButton";

/**
 * App header with title and waitlist CTA (top right).
 */
export function AppHeader() {
  return (
    <header className="shrink-0 border-b border-gray-200 bg-pitch-700 px-4 py-3 text-white shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            ⚽ World Cup Bar Tracker
          </h1>
          <p className="text-sm text-pitch-100">Bars near you · Toronto</p>
        </div>
        <WaitlistButton />
      </div>
    </header>
  );
}
