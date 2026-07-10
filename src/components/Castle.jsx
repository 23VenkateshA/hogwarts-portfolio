import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { ZONES } from '../data/resume.js'
import {
  stoneMat,
  stoneDarkMat,
  roofMat,
  woodMat,
  ironMat,
  windowMat,
  bannerClothMat,
  goldMat,
} from '../three/materials.js'

const WINDOW_WARM = '#ffb347'

/** Glowing window pane mounted on a wall or tower surface. */
function Window({ position, rotationY = 0, size = [0.7, 1.3], color = WINDOW_WARM }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} material={windowMat(color)}>
      <boxGeometry args={[size[0], size[1], 0.12]} />
    </mesh>
  )
}

/** Round tower with a conical roof and a few lit windows. */
function Tower({ position, height = 16, radius = 3, windows = 3, windowColor = WINDOW_WARM }) {
  const [x, , z] = position
  const panes = useMemo(() => {
    const list = []
    for (let i = 0; i < windows; i++) {
      const angle = (i / windows) * Math.PI * 1.6 + 0.4
      const y = height * (0.35 + 0.5 * (i / Math.max(windows - 1, 1)))
      list.push({
        pos: [Math.sin(angle) * (radius + 0.05), y, Math.cos(angle) * (radius + 0.05)],
        rot: angle,
      })
    }
    return list
  }, [windows, height, radius])
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} material={stoneMat()} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.12, height, 12]} />
      </mesh>
      <mesh position={[0, height + height * 0.14, 0]} material={roofMat()} castShadow receiveShadow>
        <coneGeometry args={[radius * 1.45, height * 0.3, 12]} />
      </mesh>
      {panes.map((p, i) => (
        <Window key={i} position={p.pos} rotationY={p.rot} color={windowColor} />
      ))}
    </group>
  )
}

/** Straight curtain wall between two ground points. */
function Wall({ from, to, height = 6, thickness = 2 }) {
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dx, dz)
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, height / 2, (from[2] + to[2]) / 2]}
      rotation={[0, angle, 0]}
      material={stoneDarkMat()}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[thickness, height, length]} />
    </mesh>
  )
}

/** The Great Hall: long nave, pitched roof, rows of tall glowing windows. */
function GreatHall() {
  const sideWindows = useMemo(() => {
    const list = []
    for (let i = 0; i < 6; i++) {
      const z = -12 + i * 4.8
      list.push({ x: 8.08, z, rot: Math.PI / 2 })
      list.push({ x: -8.08, z, rot: -Math.PI / 2 })
    }
    return list
  }, [])
  return (
    <group>
      <mesh position={[0, 5, 0]} material={stoneMat()} castShadow receiveShadow>
        <boxGeometry args={[16, 10, 30]} />
      </mesh>
      {/* Pitched roof: a long box rotated 45° so its upper half reads as a ridge.
          Kept shorter than the hall (29 < 30) so its unlit end caps stay hidden
          inside the walls instead of covering the facades. */}
      <mesh position={[0, 10, 0]} rotation={[0, 0, Math.PI / 4]} material={roofMat()} castShadow receiveShadow>
        <boxGeometry args={[11.4, 11.4, 29]} />
      </mesh>
      {sideWindows.map((w, i) => (
        <Window key={i} position={[w.x, 6, w.z]} rotationY={w.rot} size={[1.1, 3.6]} />
      ))}
      {/* Entrance doors, south face */}
      <mesh position={[0, 2.4, 15.08]} material={woodMat()} receiveShadow>
        <boxGeometry args={[3.4, 4.8, 0.2]} />
      </mesh>
      <Window position={[0, 7.6, 15.05]} size={[2.6, 2.6]} />
      {/* Entrance lanterns */}
      <Window position={[-2.6, 3.6, 15.08]} size={[0.5, 0.8]} />
      <Window position={[2.6, 3.6, 15.08]} size={[0.5, 0.8]} />
      {/* Corner turrets */}
      <Tower position={[-8.5, 0, 15]} height={13} radius={1.6} windows={2} />
      <Tower position={[8.5, 0, 15]} height={13} radius={1.6} windows={2} />
      <Tower position={[-8.5, 0, -15]} height={13} radius={1.6} windows={2} />
      <Tower position={[8.5, 0, -15]} height={13} radius={1.6} windows={2} />
      {/* One light inside for the window glow, one outside to lift the facade */}
      <pointLight position={[0, 9, 4]} color="#ffab4a" intensity={200} distance={50} decay={1.8} />
      <pointLight position={[0, 12, 24]} color="#ffc06a" intensity={220} distance={55} decay={1.8} />
    </group>
  )
}

/** Potions Dungeon: a squat, half-sunken block with sickly green light and a cauldron. */
function Dungeon() {
  return (
    <group position={[-32, 0, 6]}>
      <mesh position={[0, 2.2, 0]} material={stoneDarkMat()} castShadow receiveShadow>
        <boxGeometry args={[13, 5.2, 15]} />
      </mesh>
      {/* Roof kept shorter than the walls (14.4 < 15) so its unlit end caps stay hidden */}
      <mesh position={[0, 5.6, 0]} rotation={[0, 0, Math.PI / 4]} material={roofMat()} castShadow receiveShadow>
        <boxGeometry args={[9.4, 9.4, 14.4]} />
      </mesh>
      <Window position={[6.58, 1.6, -3]} rotationY={Math.PI / 2} color="#6dff9e" size={[1.2, 0.9]} />
      <Window position={[6.58, 1.6, 3]} rotationY={Math.PI / 2} color="#6dff9e" size={[1.2, 0.9]} />
      <Window position={[-2.5, 1.8, 7.58]} color="#6dff9e" size={[1.2, 0.9]} />
      <Tower position={[-7.5, 0, -6]} height={10} radius={2} windows={2} windowColor="#6dff9e" />
      {/* Cauldron bubbling outside the entrance */}
      <group position={[3, 0, 10.5]}>
        <mesh position={[0, 0.8, 0]} material={ironMat()} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 0.9, 1.5, 14]} />
        </mesh>
        <mesh position={[0, 1.58, 0]} material={windowMat('#2dff70', 2.6)}>
          <cylinderGeometry args={[1.12, 1.12, 0.12, 14]} />
        </mesh>
        <Sparkles count={26} scale={[3, 4, 3]} position={[0, 3, 0]} size={4} speed={0.9} color="#7dffab" />
      </group>
      <pointLight position={[2, 4, 9]} color="#3fff7e" intensity={140} distance={36} decay={1.8} />
    </group>
  )
}

/** Library tower with cool blue windows and an orbit of enchanted books. */
function Library() {
  const orbit = useRef()
  const books = useMemo(() => {
    const colors = ['#7a3b2e', '#5a4632', '#31465f', '#6b2f45', '#4a5a38']
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      r: 8 + (i % 3) * 1.4,
      y: 16 + (i % 4) * 2.2,
      tilt: (i % 5) * 0.25,
      color: colors[i % colors.length],
    }))
  }, [])
  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.y += delta * 0.22
  })
  return (
    <group position={[30, 0, -12]}>
      <Tower position={[0, 0, 0]} height={26} radius={6} windows={5} windowColor="#9bc4ff" />
      <Tower position={[8, 0, 6]} height={14} radius={2.4} windows={3} windowColor="#9bc4ff" />
      <group ref={orbit}>
        {books.map((b, i) => (
          <mesh
            key={i}
            position={[Math.sin(b.angle) * b.r, b.y, Math.cos(b.angle) * b.r]}
            rotation={[b.tilt, b.angle, 0.3]}
            castShadow
          >
            <boxGeometry args={[0.9, 0.16, 0.64]} />
            <meshPhysicalMaterial color={b.color} roughness={0.8} sheen={0.4} />
          </mesh>
        ))}
      </group>
      <Sparkles count={40} scale={[18, 14, 18]} position={[0, 19, 0]} size={2.6} speed={0.3} color="#a8c8ff" />
      <pointLight position={[10, 16, 10]} color="#7fa8ff" intensity={260} distance={48} decay={1.8} />
    </group>
  )
}

/** Common room tower draped with house banners and warm firelight. */
function CommonRoom() {
  return (
    <group position={[22, 0, 22]}>
      <Tower position={[0, 0, 0]} height={18} radius={5} windows={4} windowColor="#ff9d4d" />
      {/* House banners, angled toward the arrival viewpoint in the southeast */}
      <group position={[3.65, 10, 3.65]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[-2, 0, 0]} material={bannerClothMat('#7f0f14')} castShadow>
          <boxGeometry args={[2, 5.4, 0.08]} />
        </mesh>
        <mesh position={[-2, -2.2, 0.02]} material={goldMat()}>
          <boxGeometry args={[2, 0.5, 0.08]} />
        </mesh>
        <mesh position={[2, 0, 0]} material={bannerClothMat('#12351f')} castShadow>
          <boxGeometry args={[2, 5.4, 0.08]} />
        </mesh>
        <mesh position={[2, -2.2, 0.02]} material={bannerClothMat('#b8bcc4')}>
          <boxGeometry args={[2, 0.5, 0.08]} />
        </mesh>
      </group>
      <Sparkles count={30} scale={[14, 10, 14]} position={[0, 12, 0]} size={2.4} speed={0.35} color="#ffb36b" />
      <pointLight position={[0, 9, 8]} color="#ff8a3d" intensity={180} distance={38} decay={1.8} />
    </group>
  )
}

const labelPos = new THREE.Vector3()
const labelScreen = new THREE.Vector3()
const labelNDC = new THREE.Vector2()

/**
 * Floating golden zone label rendered in-world.
 * Visibility is managed manually (drei's `occlude` proved unreliable here):
 * a throttled raycast hides the label when castle geometry blocks it or the
 * camera is too far away. Only meshes occlude — sparkle Points are ignored.
 * Label positions must sit above their building's roofline or they would
 * occlude themselves.
 */
function ZoneLabel({ zone }) {
  const innerRef = useRef()
  const { camera, scene } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const clockRef = useRef(Math.random() * 0.25) // stagger checks across labels

  useFrame((_, delta) => {
    clockRef.current += delta
    if (clockRef.current < 0.25 || !innerRef.current) return
    clockRef.current = 0
    labelPos.set(...zone.label.position)
    const dist = camera.position.distanceTo(labelPos)
    let visible = dist < 150
    if (visible) {
      labelScreen.copy(labelPos).project(camera)
      raycaster.setFromCamera(labelNDC.set(labelScreen.x, labelScreen.y), camera)
      // Hide only when blocked by geometry that is far from the label itself —
      // a zone's own building sits right under its label and must not occlude it.
      const blocked = raycaster
        .intersectObjects(scene.children, true)
        .some(
          (i) =>
            i.object.isMesh && i.distance < dist - 2 && i.point.distanceTo(labelPos) > 18
        )
      if (blocked) visible = false
    }
    innerRef.current.style.opacity = visible ? '1' : '0'
  })

  return (
    <Html
      position={zone.label.position}
      center
      distanceFactor={45}
      zIndexRange={[5, 0]}
      wrapperClass="zone-label"
    >
      <div ref={innerRef} className="zone-label-text text-[15px]" aria-hidden="true">
        ✦ {zone.label.text} ✦
      </div>
    </Html>
  )
}

export default function Castle() {
  return (
    <group>
      <GreatHall />
      <Dungeon />
      <Library />
      <CommonRoom />
      {/* Central keep + astronomy tower for the skyline */}
      <Tower position={[4, 0, -20]} height={21} radius={5.2} windows={4} />
      <Tower position={[-14, 0, -20]} height={30} radius={3.2} windows={4} windowColor="#c9d8ff" />
      <Tower position={[-24, 0, -8]} height={12} radius={2.2} windows={2} />
      {/* Curtain walls linking the wings */}
      <Wall from={[24, 0, -12]} to={[9, 0, -18]} />
      <Wall from={[-11, 0, -20]} to={[-1, 0, -20]} />
      <Wall from={[-24, 0, -8]} to={[-16, 0, -18]} />
      <Wall from={[-28, 0, 2]} to={[-24, 0, -8]} />
      <Wall from={[-25.5, 0, 6]} to={[-8, 0, 10]} height={5} />
      <Wall from={[22, 0, 17]} to={[8, 0, 13]} height={5} />
      <Wall from={[28, 0, -7]} to={[24, 0, 17]} />
      {/* Great Hall candle-glow sparkles above the roofline */}
      <Sparkles count={70} scale={[34, 12, 44]} position={[0, 13, 0]} size={2.8} speed={0.4} color="#ffd27a" />
      {ZONES.filter((z) => z.id !== 'quidditch').map((z) => (
        <ZoneLabel key={z.id} zone={z} />
      ))}
    </group>
  )
}

export { ZoneLabel }
