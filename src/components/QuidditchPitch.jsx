import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { ZoneLabel } from './Castle.jsx'
import { ZONES } from '../data/resume.js'

const GROUND_Y = -7.5

/** Golden goal hoop on a pole. */
function Hoop({ position, height }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.3, height, 6]} />
        <meshStandardMaterial color="#8a7440" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, height + 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2, 0.22, 8, 20]} />
        <meshStandardMaterial
          color="#e8c268"
          emissive="#c79b32"
          emissiveIntensity={0.9}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  )
}

/** The Golden Snitch, darting laps around the pitch. */
function Snitch() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.55
    ref.current.position.set(
      Math.sin(t) * 16,
      -1.5 + Math.sin(t * 3.7) * 3,
      -100 + Math.cos(t) * 26
    )
    ref.current.rotation.y = -t + Math.PI / 2
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial
          color="#ffd977"
          emissive="#ffbe3d"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[0.9, 0.3]} />
        <meshStandardMaterial color="#f4f0e2" transparent opacity={0.85} side={2} />
      </mesh>
      <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, -0.5]}>
        <planeGeometry args={[0.9, 0.3]} />
        <meshStandardMaterial color="#f4f0e2" transparent opacity={0.85} side={2} />
      </mesh>
    </group>
  )
}

export default function QuidditchPitch() {
  const stands = useMemo(() => {
    const colors = ['#5c1216', '#12351f', '#1d2f52', '#565018']
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8
      return {
        x: Math.sin(a) * 30,
        z: -100 + Math.cos(a) * 48,
        rot: a,
        color: colors[i % colors.length],
      }
    })
  }, [])
  const zone = ZONES.find((z) => z.id === 'quidditch')
  return (
    <group>
      {/* Oval lawn */}
      <mesh position={[0, GROUND_Y + 0.06, -100]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.75, 1]}>
        <circleGeometry args={[25, 36]} />
        <meshStandardMaterial color="#2a4d33" roughness={1} />
      </mesh>
      {/* Pitch boundary ring */}
      <mesh position={[0, GROUND_Y + 0.1, -100]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.75, 1]}>
        <ringGeometry args={[24, 25, 40]} />
        <meshStandardMaterial color="#d9c98e" roughness={1} />
      </mesh>
      {/* Goal hoops, three per end */}
      <Hoop position={[-6, GROUND_Y, -134]} height={8} />
      <Hoop position={[0, GROUND_Y, -136]} height={11} />
      <Hoop position={[6, GROUND_Y, -134]} height={8} />
      <Hoop position={[-6, GROUND_Y, -66]} height={8} />
      <Hoop position={[0, GROUND_Y, -64]} height={11} />
      <Hoop position={[6, GROUND_Y, -66]} height={8} />
      {/* Spectator stands */}
      {stands.map((s, i) => (
        <mesh key={i} position={[s.x, GROUND_Y + 2.2, s.z]} rotation={[0, s.rot, 0]}>
          <boxGeometry args={[10, 4.4, 2.6]} />
          <meshStandardMaterial color={s.color} roughness={0.95} flatShading />
        </mesh>
      ))}
      <Snitch />
      <Sparkles count={36} scale={[46, 14, 70]} position={[0, 0, -100]} size={2.4} speed={0.5} color="#e8ecff" />
      <pointLight position={[0, 8, -100]} color="#cdd8ff" intensity={220} distance={70} decay={1.8} />
      {zone && <ZoneLabel zone={zone} />}
    </group>
  )
}
