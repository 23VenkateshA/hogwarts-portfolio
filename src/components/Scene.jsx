import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Stars, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Castle from './Castle.jsx'
import QuidditchPitch from './QuidditchPitch.jsx'
import Candles from './Candles.jsx'
import LightShafts from './LightShafts.jsx'
import { rockMat, grassMat, lakeMat, treeMat } from '../three/materials.js'

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

/** Valley floor with gentle procedural undulation, flattened under the pitch. */
function useValleyGeometry() {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(640, 640, 96, 96)
    const rand = mulberry32(53)
    const octaves = []
    for (let o = 0; o < 3; o++) {
      const cells = 6 * 2 ** o
      const grid = new Float32Array(cells * cells)
      for (let i = 0; i < grid.length; i++) grid[i] = rand()
      octaves.push({ cells, grid })
    }
    const smooth = (t) => t * t * (3 - 2 * t)
    const noise = (x, y) => {
      let v = 0
      let amp = 0.5
      for (const { cells, grid } of octaves) {
        const gx = ((x % 1) + 1) % 1 * cells
        const gy = ((y % 1) + 1) % 1 * cells
        const x0 = Math.floor(gx) % cells
        const y0 = Math.floor(gy) % cells
        const x1 = (x0 + 1) % cells
        const y1 = (y0 + 1) % cells
        const fx = smooth(gx - Math.floor(gx))
        const fy = smooth(gy - Math.floor(gy))
        const a = grid[y0 * cells + x0]
        const b = grid[y0 * cells + x1]
        const c = grid[y1 * cells + x0]
        const d = grid[y1 * cells + x1]
        v += (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * amp
        amp *= 0.5
      }
      return v
    }
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i) // plane local Y → world -Z after rotation
      const wz = -y
      let h = (noise(x / 640 + 0.5, y / 640 + 0.5) - 0.5) * 6
      // Flatten under the Quidditch pitch and around the castle plateau
      const pitchDist = Math.hypot(x, wz + 100)
      const plateauDist = Math.hypot(x, wz)
      h *= THREE.MathUtils.smoothstep(pitchDist, 40, 75)
      h *= THREE.MathUtils.smoothstep(plateauDist, 55, 85)
      // Bowl the lake area slightly
      const lakeDist = Math.hypot(x - 100, wz - 60)
      h -= (1 - THREE.MathUtils.smoothstep(lakeDist, 30, 60)) * 1.5
      pos.setZ(i, h)
    }
    geo.computeVertexNormals()
    return geo
  }, [])
}

function Terrain() {
  const valleyGeo = useValleyGeometry()
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
      <mesh position={[0, -4, 0]} material={rockMat()} castShadow receiveShadow>
        <cylinderGeometry args={[58, 74, 8, 32]} />
      </mesh>
      {/* Courtyard lawn on the plateau */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={grassMat()} receiveShadow>
        <circleGeometry args={[58, 32]} />
      </mesh>
      {/* Valley floor */}
      <mesh
        position={[0, -7.6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={valleyGeo}
        material={grassMat()}
        receiveShadow
      />
      {/* The Black Lake */}
      <mesh position={[100, -7.2, 60]} rotation={[-Math.PI / 2, 0, 0]} material={lakeMat()}>
        <circleGeometry args={[52, 48]} />
      </mesh>
      {/* Forbidden Forest */}
      {trees.map((t, i) => (
        <mesh key={i} position={[t.x, -7.5 + t.h / 2, t.z]} material={treeMat()} castShadow>
          <coneGeometry args={[t.r, t.h, 7]} />
        </mesh>
      ))}
      {/* Distant peaks */}
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, -7.5 + m.h / 2 - 4, m.z]} material={rockMat()}>
          <coneGeometry args={[m.r, m.h, 9]} />
        </mesh>
      ))}
    </group>
  )
}

function Moon() {
  return (
    <mesh position={[110, 85, -140]}>
      <sphereGeometry args={[9, 32, 24]} />
      <meshStandardMaterial
        color="#f2ecd8"
        emissive="#f5eed6"
        emissiveIntensity={2.4}
        roughness={1}
      />
    </mesh>
  )
}

/** Procedural night-sky environment map: moonlight + horizon glow for PBR reflections. */
function NightEnvironment() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.environmentIntensity = 0.75
  }, [scene])
  return (
    <Environment frames={1} resolution={128}>
      <color attach="background" args={['#060b1a']} />
      {/* Moon disc */}
      <Lightformer form="circle" intensity={6} color="#e8e4d4" position={[8, 7, -10]} scale={3} />
      {/* Cold sky dome fill */}
      <Lightformer form="rect" intensity={0.7} color="#31406e" position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[40, 40, 1]} />
      {/* Faint warm horizon (distant castle-town glow) */}
      <Lightformer form="rect" intensity={0.4} color="#3a3350" position={[0, -1, 12]} scale={[40, 4, 1]} />
    </Environment>
  )
}

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#0a1022']} />
      {/* Exponential fog: deeper mood, hides the world edge */}
      <fogExp2 attach="fog" args={['#0a1022', 0.0055]} />
      <ambientLight color="#59689e" intensity={0.45} />
      {/* Moonlight: the single shadow-casting light, VSM-blurred for soft edges */}
      <directionalLight
        position={[70, 90, -30]}
        color="#aebfec"
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={110}
        shadow-camera-bottom={-150}
        shadow-camera-near={20}
        shadow-camera-far={300}
        shadow-radius={7}
        shadow-blurSamples={16}
        shadow-bias={-0.0002}
      />
      <Stars radius={260} depth={60} count={3000} factor={5} saturation={0} fade speed={0.5} />
      <NightEnvironment />
      <Moon />
      <Terrain />
      <Castle />
      <QuidditchPitch />
      <Candles />
      <LightShafts />
    </>
  )
}
