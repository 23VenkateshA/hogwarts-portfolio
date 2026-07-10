import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Volumetric god rays: custom GLSL light shafts bleeding out of glowing
 * windows. Each shaft is a pair of crossed, additively-blended planes whose
 * fragment shader fades along the beam, feathers the edges, and flickers
 * slightly like candlelight. Cheap (no ray marching) but reads as volumetric.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  void main() {
    // Bright at the window (uv.y = 1), fading toward the ground
    float along = pow(smoothstep(0.0, 1.0, vUv.y), 1.7);
    // Feathered beam edges
    float edge = smoothstep(0.0, 0.32, vUv.x) * smoothstep(1.0, 0.68, vUv.x);
    // Gentle candle flicker drifting across the beam
    float flicker = 0.82 + 0.18 * sin(uTime * 1.9 + vUv.x * 9.0) * sin(uTime * 0.7);
    float a = along * edge * uIntensity * flicker;
    gl_FragColor = vec4(uColor, a);
  }
`

function Shaft({ position, rotationY = 0, tilt = 0.9, width = 2.2, length = 11, color = '#ffc06a', intensity = 0.32 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uTime: { value: 0 },
          uIntensity: { value: intensity },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [color, intensity]
  )
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime
  })
  // Geometry pivot at the top edge so the group origin sits at the window
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, length)
    g.translate(0, -length / 2, 0)
    return g
  }, [width, length])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group rotation={[tilt, 0, 0]}>
        <mesh geometry={geometry} material={material} />
        <mesh geometry={geometry} material={material} rotation={[0, Math.PI / 2.6, 0]} />
      </group>
    </group>
  )
}

export default function LightShafts() {
  return (
    <group>
      {/* Great Hall south facade: rose window + flanking lancets.
          South-facing shafts need NEGATIVE tilt so rotateX swings the hanging
          beam outward (+z); yaw-rotated east shafts need positive tilt. */}
      <Shaft position={[0, 8.4, 15.2]} tilt={-0.9} width={3.4} length={15} intensity={0.34} />
      <Shaft position={[-4.6, 6.4, 15.2]} tilt={-0.9} width={1.6} length={10} intensity={0.22} />
      <Shaft position={[4.6, 6.4, 15.2]} tilt={-0.9} width={1.6} length={10} intensity={0.22} />
      {/* Great Hall long east wall lancets */}
      <Shaft position={[8.2, 6.6, -6]} rotationY={-Math.PI / 2} width={2} length={10} intensity={0.2} />
      <Shaft position={[8.2, 6.6, 3.6]} rotationY={-Math.PI / 2} width={2} length={10} intensity={0.2} />
      {/* Potions Dungeon: sickly green spill */}
      <Shaft position={[-25.4, 2.4, 3]} rotationY={-Math.PI / 2} tilt={1.15} width={2.4} length={7} color="#59ff96" intensity={0.3} />
      {/* Library tower: cool blue shaft from the upper stacks */}
      <Shaft position={[30, 20, -5.8]} tilt={-0.75} width={2.4} length={13} color="#8fb4ff" intensity={0.22} />
    </group>
  )
}
