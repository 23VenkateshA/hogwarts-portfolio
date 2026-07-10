import { useMemo } from 'react'
import { Stars } from '@react-three/drei'
import Castle from './Castle.jsx'
import QuidditchPitch from './QuidditchPitch.jsx'
import Candles from './Candles.jsx'

/** Seeded pseudo-random so the forest doesn't reshuffle on hot reload. */
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Terrain() {
  const { trees, mountains } = useMemo(() => {
    const rand = mulberry32(1997)
    const trees = Array.from({ length: 40 }, () => {
      const angle = rand() * Math.PI * 2
      const dist = 70 + rand() * 90
      return {
        x: Math.sin(angle) * dist,
        z: Math.cos(angle) * dist * 0.9 + 20,
        h: 5 + rand() * 7,
        r: 1.6 + rand() * 1.6,
      }
    }).filter((t) => !(Math.abs(t.x) < 40 && t.z < -50)) // keep the pitch clear
    const mountains = Array.from({ length: 7 }, (_, i) => {
      const angle = (i / 7) * Math.PI * 2 + 0.5
      return {
        x: Math.sin(angle) * 230,
        z: Math.cos(angle) * 230,
        h: 60 + rand() * 50,
        r: 55 + rand() * 30,
      }
    })
    return { trees, mountains }
  }, [])

  return (
    <group>
      {/* Castle plateau */}
      <mesh position={[0, -4, 0]}>
        <cylinderGeometry args={[58, 74, 8, 24]} />
        <meshStandardMaterial color="#2b3350" roughness={1} flatShading />
      </mesh>
      {/* Courtyard lawn on the plateau */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[58, 24]} />
        <meshStandardMaterial color="#28304a" roughness={1} />
      </mesh>
      {/* Valley floor */}
      <mesh position={[0, -7.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[320, 48]} />
        <meshStandardMaterial color="#141c33" roughness={1} />
      </mesh>
      {/* The Black Lake */}
      <mesh position={[100, -7.45, 60]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[52, 36]} />
        <meshStandardMaterial
          color="#16324e"
          emissive="#0d2238"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>
      {/* Forbidden Forest */}
      {trees.map((t, i) => (
        <mesh key={i} position={[t.x, -7.5 + t.h / 2, t.z]}>
          <coneGeometry args={[t.r, t.h, 6]} />
          <meshStandardMaterial color="#16261c" roughness={1} flatShading />
        </mesh>
      ))}
      {/* Distant peaks */}
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, -7.5 + m.h / 2 - 4, m.z]}>
          <coneGeometry args={[m.r, m.h, 7]} />
          <meshStandardMaterial color="#1a2138" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Moon() {
  return (
    <mesh position={[110, 85, -140]}>
      <sphereGeometry args={[9, 24, 18]} />
      <meshBasicMaterial color="#f2ecd8" toneMapped={false} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#0a1022']} />
      <fog attach="fog" args={['#0a1022', 70, 300]} />
      <ambientLight color="#59689e" intensity={0.85} />
      <directionalLight position={[70, 90, -30]} color="#aebfec" intensity={1.1} />
      <Stars radius={260} depth={60} count={3000} factor={5} saturation={0} fade speed={0.5} />
      <Moon />
      <Terrain />
      <Castle />
      <QuidditchPitch />
      <Candles />
    </>
  )
}
