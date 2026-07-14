import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { waxMat, windowMat } from '../three/materials.js'

/**
 * Floating candles drifting above the Great Hall courtyard, à la the movies.
 * Two instanced meshes (wax bodies + flames) sharing one set of positions,
 * so 40 candles cost two draw calls.
 */
export default function Candles({ count = 40 }) {
  const bodies = useRef()
  const flames = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      // Hovering along the castle's lit south front, drifting over the cliff edge
      Array.from({ length: count }, () => ({
        x: -24 + Math.random() * 36,
        y: 10 + Math.random() * 8,
        z: 38 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.7,
      })),
    [count]
  )

  useFrame(({ clock }) => {
    if (!bodies.current || !flames.current) return
    const t = clock.elapsedTime
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const y = s.y + Math.sin(t * s.speed + s.phase) * 0.6
      dummy.position.set(s.x, y, s.z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      bodies.current.setMatrixAt(i, dummy.matrix)
      dummy.position.set(s.x, y + 0.72, s.z)
      dummy.scale.setScalar(0.8 + Math.sin(t * 9 + s.phase * 3) * 0.22)
      dummy.updateMatrix()
      flames.current.setMatrixAt(i, dummy.matrix)
    }
    bodies.current.instanceMatrix.needsUpdate = true
    flames.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[null, null, count]} frustumCulled={false} material={waxMat()}>
        <cylinderGeometry args={[0.13, 0.17, 0.9, 8]} />
      </instancedMesh>
      <instancedMesh
        ref={flames}
        args={[null, null, count]}
        frustumCulled={false}
        material={windowMat('#ffae34', 3.4)}
      >
        <octahedronGeometry args={[0.17, 0]} />
      </instancedMesh>
    </group>
  )
}
