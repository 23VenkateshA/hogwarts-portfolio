import { useEffect, useRef } from 'react'
import { PROFILE, ZONES } from '../data/resume.js'

/**
 * The Marauder's Map: a fully text-based 2D fallback of the whole portfolio.
 * Semantic headings + lists so screen-reader users get everything the 3D
 * fly-through reveals, plus "Travel here" shortcuts into the 3D scene.
 */
export default function MaraudersMap({ onClose, onTravel }) {
  const closeRef = useRef()

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Marauder's Map — text version of the full portfolio"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-3 sm:p-8"
    >
      <div className="parchment parchment-scroll relative h-full w-full max-w-3xl overflow-y-auto rounded-lg p-6 sm:p-10">
        <button
          ref={closeRef}
          onClick={onClose}
          className="font-display sticky top-0 float-right z-10 rounded border border-[#a9854e] bg-[#efdfba] px-3 py-1.5 text-sm text-[#5a3d16] transition-colors hover:bg-[#e2ce9f] focus-visible:ring-2 focus-visible:ring-[#8a6a26]"
        >
          Mischief managed ✕
        </button>

        <header>
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[#8a6a26]">
            Messrs. Moony, Wormtail, Padfoot & Prongs present
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-[#2c1e0e]">
            The Marauder&rsquo;s Map
          </h1>
          <p className="mt-1 italic text-[#6b5636]">
            &ldquo;I solemnly swear that I am up to no good.&rdquo;
          </p>
          <p className="mt-4 text-[15px] leading-relaxed">
            <strong>{PROFILE.name}</strong> — {PROFILE.tagline}. {PROFILE.location} ·{' '}
            <a className="underline" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>{' '}
            ·{' '}
            <a
              className="underline"
              href={`https://${PROFILE.linkedin}`}
              target="_blank"
              rel="noreferrer"
            >
              {PROFILE.linkedin}
            </a>
          </p>
          <p className="mt-2 text-[14px] italic text-[#6b5636]">
            This map holds everything the castle does — every hall, dungeon, and pitch — in
            plain, readable text.
          </p>
        </header>

        {ZONES.map((zone) => (
          <section key={zone.id} className="mt-8 border-t border-[#c9ab72] pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-[#2c1e0e]">
                {zone.name}{' '}
                <span className="text-sm font-medium text-[#8a6a26]">— {zone.theme}</span>
              </h2>
              <button
                onClick={() => onTravel(zone.id)}
                className="font-display rounded border border-[#a9854e] px-2.5 py-1 text-xs text-[#5a3d16] transition-colors hover:bg-[#e2ce9f] focus-visible:ring-2 focus-visible:ring-[#8a6a26]"
              >
                ✦ Travel here in 3D
              </button>
            </div>
            {zone.sections.map((section) => (
              <div key={section.heading} className="mt-4">
                <h3 className="font-display text-[15px] font-semibold text-[#4a2f10]">
                  {section.heading}
                </h3>
                {section.sub && (
                  <p className="text-[13px] italic text-[#8a6a3a]">{section.sub}</p>
                )}
                <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <footer className="mt-10 border-t border-[#c9ab72] pt-4 text-center italic text-[#8a6a3a]">
          &ldquo;Mischief managed.&rdquo;
        </footer>
      </div>
    </div>
  )
}
