import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Volumetric god rays: custom GLSL light shafts bleeding out of the castle
 * model's glowing windows. Each shaft is a pair of crossed, additively-blended
 * planes whose fragment shader fades along the beam, feathers the edges, and
 * flickers slightly like candlelight.
 *
 * Positions are probed against the fitted model (raycasts): the Great Hall's
 * lancet wall sits at z≈37.5, the keep's south face at z≈1.7. South-facing
 * shafts use NEGATIVE tilt so rotateX swings the hanging beam outward (+z).
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
    float along = pow(smoothstep(0.0, 1.0, vUv.y), 1.7);
    float edge = smoothstep(0.0, 0.32, vUv.x) * smoothstep(1.0, 0.68, vUv.x);
    float flicker = 0.82 + 0.18 * sin(uTime * 1.9 + vUv.x * 9.0) * sin(uTime * 0.7);
    float a = along * edge * uIntensity * flicker;
    gl_FragColor = vec4(uColor, a);
  }
`

function Shaft({ position, rotationY = 0, tilt = -0.9, width = 2.2, length = 11, color = '#ffc06a', intensity = 0.26 }) {
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
      {/* Great Hall south lancets, spilling over the cliff forecourt */}
      <Shaft position={[-17, 13, 37.8]} width={2.6} length={13} intensity={0.28} />
      <Shaft position={[-11, 13, 37.8]} width={2.6} length={13} intensity={0.3} />
      <Shaft position={[-5, 13, 37.8]} width={2.6} length={13} intensity={0.28} />
      {/* Keep (Library) upper window on the north face, beaming over the rooftops.
          rotationY=π flips the frame, so negative tilt still swings the beam outward (−z). */}
      <Shaft position={[4, 45, -5.5]} rotationY={Math.PI} tilt={-0.75} width={2.4} length={15} color="#8fb4ff" intensity={0.22} />
      {/* Dungeon cliff base: sickly green wash */}
      <Shaft position={[-26, 8, 21]} tilt={-1.1} width={3} length={8} color="#59ff96" intensity={0.24} />
    </group>
  )
}
