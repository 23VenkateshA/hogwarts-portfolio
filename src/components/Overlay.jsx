import { useEffect, useRef } from 'react'

/** Parchment resume panel revealed when the camera enters a castle zone. */
export default function Overlay({ zone, onClose, autoFocus }) {
  const panelRef = useRef()

  // After an explicit fly-to, move focus into the panel so keyboard/screen-reader
  // users land on the content. Proximity reveals during free flight keep focus
  // where it is, so held movement keys aren't interrupted.
  useEffect(() => {
    if (autoFocus) panelRef.current?.focus()
  }, [zone.id, autoFocus])

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label={`${zone.name} — ${zone.theme}`}
      className="parchment parchment-scroll overlay-enter fixed right-3 top-16 bottom-24 z-20 w-[min(92vw,430px)] overflow-y-auto rounded-lg p-6 outline-none sm:right-5 sm:top-20"
    >
      <button
        onClick={onClose}
        aria-label="Close panel"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#a9854e] text-[#6b4f26] transition-colors hover:bg-[#e2ce9f] focus-visible:ring-2 focus-visible:ring-[#8a6a26]"
      >
        ✕
      </button>

      <p className="font-display text-[11px] uppercase tracking-[0.28em] text-[#8a6a26]">
        {zone.theme}
      </p>
      <h2 className="font-display mt-1 text-2xl font-bold text-[#2c1e0e]">{zone.name}</h2>
      <p className="mt-2 border-b border-[#c9ab72] pb-3 italic text-[#6b5636]">{zone.flavor}</p>

      {zone.sections.map((section) => (
        <section key={section.heading} className="mt-5">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-[#4a2f10]">
            {section.heading}
          </h3>
          {section.sub && (
            <p className="mt-0.5 text-[13px] italic text-[#8a6a3a]">{section.sub}</p>
          )}
          <ul className="mt-2 space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-relaxed">
                <span aria-hidden="true" className="mt-0.5 text-[#a9854e]">
                  ⚡
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Wax seal */}
      <div className="mt-6 flex justify-end" aria-hidden="true">
        <div
          className="font-display flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-[#f3d9a0]"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #a32830, #5f0e14 70%)',
            boxShadow: '0 2px 6px rgba(60,10,10,.5), inset 0 0 8px rgba(255,200,150,.25)',
          }}
        >
          AV
        </div>
      </div>
    </aside>
  )
}
