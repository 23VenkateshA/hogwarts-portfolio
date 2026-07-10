import { ZONES } from '../data/resume.js'

/** Bottom zone navigation + top chrome (title, controls hint, map toggle). */
export default function Navigation({ activeZoneId, onSelect, onToggleMap, mapOpen }) {
  return (
    <>
      {/* Top bar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <h1 className="font-display text-sm font-semibold tracking-[0.2em] text-[#ffe9b0] drop-shadow-[0_0_10px_rgba(255,190,80,0.45)] sm:text-base">
            ARVIND VENKATESH
          </h1>
          <p className="mt-1 hidden max-w-sm text-[12px] leading-relaxed text-[#b9c3e6] sm:block">
            Drag to look · WASD/arrows to fly · Q/E altitude · Shift sprint ·{' '}
            <span className="whitespace-nowrap">1–5 zones</span> · M map
          </p>
        </div>
        <button
          onClick={onToggleMap}
          aria-pressed={mapOpen}
          className="font-display pointer-events-auto rounded border border-[#d4af5f]/60 bg-[#1a2138]/80 px-3 py-2 text-xs tracking-wider text-[#ffe9b0] backdrop-blur transition-colors hover:bg-[#2a3252] focus-visible:ring-2 focus-visible:ring-[#d4af5f] sm:text-sm"
        >
          🗺 Marauder&rsquo;s Map <span className="hidden sm:inline">(text version)</span>
        </button>
      </header>

      {/* Zone navigation */}
      <nav
        aria-label="Castle zones"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-3"
      >
        <ul className="flex max-w-full flex-wrap justify-center gap-1.5 rounded-lg border border-[#d4af5f]/40 bg-[#101830]/85 p-1.5 backdrop-blur sm:gap-2 sm:p-2">
          {ZONES.map((zone, i) => {
            const active = zone.id === activeZoneId
            return (
              <li key={zone.id}>
                <button
                  onClick={(e) => {
                    e.currentTarget.blur() // release focus so WASD flight resumes immediately
                    onSelect(zone.id)
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={`font-display rounded px-2.5 py-1.5 text-left text-[11px] leading-tight tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-[#d4af5f] sm:px-3 sm:text-[12px] ${
                    active
                      ? 'bg-[#d4af5f] text-[#241806]'
                      : 'text-[#e6d9ae] hover:bg-[#263052] hover:text-[#ffe9b0]'
                  }`}
                >
                  <span className="mr-1 opacity-60">{i + 1}</span>
                  {zone.name}
                  <span
                    className={`block text-[10px] font-normal normal-case ${
                      active ? 'text-[#4a3a14]' : 'text-[#8d97bd]'
                    }`}
                  >
                    {zone.theme}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
