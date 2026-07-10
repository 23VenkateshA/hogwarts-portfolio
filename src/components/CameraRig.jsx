import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

const PITCH_LIMIT = 1.45
const FLY_DURATION = 2.6

/** True when a key event should drive the camera (not a form control or dialog). */
function isSceneKeyEvent(e) {
  const t = e.target
  if (!(t instanceof Element)) return true
  if (t.closest('input, textarea, select, [role="dialog"]')) return false
  // Let Space/Enter keep their native button behavior.
  if (t.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return false
  return true
}

/**
 * Free-fly camera with GSAP waypoint travel.
 *  - Drag to look (yaw/pitch), WASD or arrows to fly, Q/E for altitude, Shift to sprint.
 *  - `flyRequest` ({ zoneId, token }) tweens position + gaze to the zone waypoint.
 *  - Reports proximity-based zone entry/exit for overlay reveals while free-flying.
 */
export default function CameraRig({ zones, flyRequest, onArrive, onProximity, inputEnabled }) {
  const { camera, gl } = useThree()
  const advance = useThree((s) => s.advance)
  const scene = useThree((s) => s.scene)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const keys = useRef({})
  const flying = useRef(false)
  const lookPoint = useRef(new THREE.Vector3())
  const nearZone = useRef(undefined)
  const checkClock = useRef(0)
  const inputRef = useRef(inputEnabled)
  inputRef.current = inputEnabled

  const syncAnglesFromGaze = (target) => {
    const dir = target.clone().sub(camera.position).normalize()
    pitch.current = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1))
    yaw.current = Math.atan2(-dir.x, -dir.z)
  }

  // Initial orientation: gaze at the castle from the opening vantage point.
  useEffect(() => {
    camera.rotation.order = 'YXZ'
    const target = new THREE.Vector3(0, 8, 0)
    syncAnglesFromGaze(target)
    camera.rotation.set(pitch.current, yaw.current, 0)
    lookPoint.current.copy(target)
    // Dev-only hook so animation state can be driven/inspected headlessly
    // (rAF is paused in hidden tabs, freezing GSAP and the frame loop).
    if (import.meta.env.DEV) {
      window.__hogwarts = { camera, gsap, advance, scene, THREE, keys, flying }
    }
  }, [camera]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse / touch drag-to-look.
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let px = 0
    let py = 0
    const down = (e) => {
      dragging = true
      px = e.clientX
      py = e.clientY
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
      if (!dragging || flying.current || !inputRef.current) return
      yaw.current -= (e.clientX - px) * 0.0035
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - (e.clientY - py) * 0.0035,
        -PITCH_LIMIT,
        PITCH_LIMIT
      )
      px = e.clientX
      py = e.clientY
    }
    const up = () => {
      dragging = false
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  // Keyboard state.
  useEffect(() => {
    const down = (e) => {
      if (!isSceneKeyEvent(e)) return
      keys.current[e.code] = true
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)
      ) {
        e.preventDefault()
      }
    }
    const up = (e) => {
      keys.current[e.code] = false
    }
    const blur = () => {
      keys.current = {}
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  // GSAP fly-through to a zone waypoint.
  useEffect(() => {
    if (!flyRequest) return
    const zone = zones.find((z) => z.id === flyRequest.zoneId)
    if (!zone) return
    const [tx, ty, tz] = zone.camera.position
    const [lx, ly, lz] = zone.camera.lookAt
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 0 : FLY_DURATION

    // Start the gaze tween from wherever the camera is currently looking.
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    lookPoint.current.copy(camera.position).addScaledVector(forward, 24)

    flying.current = true
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(lookPoint.current)
    gsap.to(camera.position, { x: tx, y: ty, z: tz, duration, ease: 'power2.inOut' })
    gsap.to(lookPoint.current, {
      x: lx,
      y: ly,
      z: lz,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(lookPoint.current),
      onComplete: () => {
        camera.lookAt(lookPoint.current)
        syncAnglesFromGaze(lookPoint.current)
        flying.current = false
        nearZone.current = zone.id
        onArrive(zone.id)
      },
    })
  }, [flyRequest]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (flying.current) return
    if (inputRef.current) {
      const k = keys.current
      const sprint = k.ShiftLeft || k.ShiftRight
      const speed = (sprint ? 36 : 14) * Math.min(delta, 0.1)
      const cy = Math.cos(yaw.current)
      const sy = Math.sin(yaw.current)
      const cp = Math.cos(pitch.current)
      const forward = new THREE.Vector3(-sy * cp, Math.sin(pitch.current), -cy * cp)
      const right = new THREE.Vector3(cy, 0, -sy)
      if (k.KeyW || k.ArrowUp) camera.position.addScaledVector(forward, speed)
      if (k.KeyS || k.ArrowDown) camera.position.addScaledVector(forward, -speed)
      if (k.KeyA || k.ArrowLeft) camera.position.addScaledVector(right, -speed)
      if (k.KeyD || k.ArrowRight) camera.position.addScaledVector(right, speed)
      if (k.KeyE || k.Space) camera.position.y += speed
      if (k.KeyQ) camera.position.y -= speed
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.2, 95)
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -170, 170)
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -180, 180)
      camera.rotation.set(pitch.current, yaw.current, 0)
    }

    // Proximity-based zone detection, ~4 checks/sec.
    checkClock.current += delta
    if (checkClock.current > 0.25) {
      checkClock.current = 0
      let best = null
      let bestScore = Infinity
      for (const z of zones) {
        const d = Math.hypot(
          camera.position.x - z.anchor[0],
          camera.position.z - z.anchor[2]
        )
        const score = d / z.radius
        if (score < 1 && score < bestScore) {
          best = z.id
          bestScore = score
        }
      }
      if (best !== nearZone.current) {
        nearZone.current = best
        onProximity(best)
      }
    }
  })

  return null
}
