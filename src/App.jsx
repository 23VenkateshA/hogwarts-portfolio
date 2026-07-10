import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene.jsx'
import CameraRig from './components/CameraRig.jsx'
import Overlay from './components/Overlay.jsx'
import MaraudersMap from './components/MaraudersMap.jsx'
import Navigation from './components/Navigation.jsx'
import { ZONES } from './data/resume.js'

const INTRO_CAMERA = [72, 44, 118]

export default function App() {
  const [overlayZoneId, setOverlayZoneId] = useState(null)
  const [overlayFocus, setOverlayFocus] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [flyRequest, setFlyRequest] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const tokenRef = useRef(0)
  const mapOpenRef = useRef(false)
  mapOpenRef.current = mapOpen

  const flyTo = useCallback((zoneId) => {
    setMapOpen(false)
    setOverlayZoneId(null)
    tokenRef.current += 1
    setFlyRequest({ zoneId, token: tokenRef.current })
  }, [])

  // Cinematic opening: sweep from above the lake into the Great Hall.
  useEffect(() => {
    const timer = setTimeout(() => flyTo('great-hall'), 700)
    return () => clearTimeout(timer)
  }, [flyTo])

  const announceZone = useCallback((zone) => {
    setAnnouncement(`Arrived at ${zone.name} — ${zone.theme}`)
  }, [])

  const handleArrive = useCallback(
    (zoneId) => {
      const zone = ZONES.find((z) => z.id === zoneId)
      if (!zone) return
      setOverlayFocus(true)
      setOverlayZoneId(zoneId)
      announceZone(zone)
    },
    [announceZone]
  )

  const handleProximity = useCallback(
    (zoneId) => {
      setOverlayFocus(false)
      setOverlayZoneId(zoneId)
      if (zoneId) {
        const zone = ZONES.find((z) => z.id === zoneId)
        if (zone) announceZone(zone)
      }
    },
    [announceZone]
  )

  // Global shortcuts: M toggles the map, Escape closes, 1–5 fly to zones.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (mapOpenRef.current) setMapOpen(false)
        else setOverlayZoneId(null)
        return
      }
      // Remaining shortcuts only when not typing in a form control.
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return
      if (e.key === 'm' || e.key === 'M') {
        setMapOpen((v) => !v)
        return
      }
      const index = parseInt(e.key, 10) - 1
      if (index >= 0 && index < ZONES.length) flyTo(ZONES[index].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flyTo])

  const overlayZone = ZONES.find((z) => z.id === overlayZoneId)

  return (
    <div className="h-full w-full font-body">
      {/* 3D castle. Hidden from the accessibility tree — the Marauder's Map is the accessible version. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${mapOpen ? 'pointer-events-none' : ''}`}
      >
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: INTRO_CAMERA, fov: 55, near: 0.3, far: 700 }}
        >
          <Scene />
          <CameraRig
            zones={ZONES}
            flyRequest={flyRequest}
            onArrive={handleArrive}
            onProximity={handleProximity}
            inputEnabled={!mapOpen}
          />
        </Canvas>
      </div>

      {/* Opening splash */}
      <div
        aria-hidden="true"
        className="splash pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#070b16]"
      >
        <div className="text-center">
          <p className="font-display text-2xl tracking-[0.3em] text-[#ffe9b0]">HOGWARTS</p>
          <p className="mt-2 text-sm italic tracking-widest text-[#8d97bd]">
            a portfolio of witchcraft &amp; wizardry
          </p>
        </div>
      </div>

      <Navigation
        activeZoneId={overlayZoneId}
        onSelect={flyTo}
        onToggleMap={() => setMapOpen((v) => !v)}
        mapOpen={mapOpen}
      />

      {overlayZone && !mapOpen && (
        <Overlay
          zone={overlayZone}
          autoFocus={overlayFocus}
          onClose={() => setOverlayZoneId(null)}
        />
      )}

      {mapOpen && <MaraudersMap onClose={() => setMapOpen(false)} onTravel={flyTo} />}

      {/* Screen-reader announcements for zone arrivals */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
