import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { ZoneLabel } from './Castle.jsx'
import { ZONES } from '../data/resume.js'
import { goldMat, woodMat, pitchGrassMat, windowMat, bannerClothMat } from '../three/materials.js'

const GROUND_Y = -7.5

/** Golden goal hoop on a pole. */
function Hoop({ position, height }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} material={woodMat()} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.3, height, 8]} />
      </mesh>
      <mesh position={[0, height + 2, 0]} rotation={[0, Math.PI / 2, 0]} material={goldMat()} castShadow>
        <torusGeometry args={[2, 0.22, 10, 28]} />
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
      <mesh material={windowMat('#ffbe3d', 2.6)}>
        <sphereGeometry args={[0.32, 16, 12]} />
      </mesh>
      <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[0.9, 0.3]} />
        <meshPhysicalMaterial color="#f4f0e2" transparent opacity={0.85} side={2} roughness={0.3} />
      </mesh>
      <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, -0.5]}>
        <planeGeometry args={[0.9, 0.3]} />
        <meshPhysicalMaterial color="#f4f0e2" transparent opacity={0.85} side={2} roughness={0.3} />
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
      <mesh
        position={[0, GROUND_Y + 0.06, -100]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 1.75, 1]}
        material={pitchGrassMat()}
        receiveShadow
      >
        <circleGeometry args={[25, 48]} />
      </mesh>
      {/* Pitch boundary ring */}
      <mesh position={[0, GROUND_Y + 0.1, -100]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.75, 1]} receiveShadow>
        <ringGeometry args={[24, 25, 48]} />
        <meshPhysicalMaterial color="#cbbd88" roughness={0.9} />
      </mesh>
      {/* Goal hoops, three per end */}
      <Hoop position={[-6, GROUND_Y, -134]} height={8} />
      <Hoop position={[0, GROUND_Y, -136]} height={11} />
      <Hoop position={[6, GROUND_Y, -134]} height={8} />
      <Hoop position={[-6, GROUND_Y, -66]} height={8} />
      <Hoop position={[0, GROUND_Y, -64]} height={11} />
      <Hoop position={[6, GROUND_Y, -66]} height={8} />
      {/* Spectator stands: cloth-draped boxes on wood frames */}
      {stands.map((s, i) => (
        <group key={i} position={[s.x, GROUND_Y + 2.2, s.z]} rotation={[0, s.rot, 0]}>
          <mesh material={woodMat()} castShadow receiveShadow>
            <boxGeometry args={[10, 4.4, 2.6]} />
          </mesh>
          <mesh position={[0, 0.2, 1.36]} material={bannerClothMat(s.color)} castShadow>
            <boxGeometry args={[9.2, 3.6, 0.1]} />
          </mesh>
        </group>
      ))}
      <Snitch />
      <Sparkles count={36} scale={[46, 14, 70]} position={[0, 0, -100]} size={2.4} speed={0.5} color="#e8ecff" />
      <pointLight position={[0, 14, -100]} color="#cdd8ff" intensity={700} distance={95} decay={1.8} />
      {zone && <ZoneLabel zone={zone} />}
    </group>
  )
}
