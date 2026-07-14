import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = import.meta.env.BASE_URL + 'models/hogwarts.glb'

/**
 * The artist-modeled Hogwarts castle (from the provided .blend, exported to a
 * meshopt-compressed GLB). The model is auto-fitted: scaled to `footprint`
 * world units on its longest ground axis, centered at the origin, base resting
 * on y = 0 (the castle plateau).
 *
 * Night-time material treatment:
 *  - `LUZ*` (light planes) and `VIDROS` (glass) become warm emissives strong
 *    enough to trip the Bloom threshold, so every window in the model glows.
 *  - Everything else keeps its authored PBR maps (the TexturesCom brick set
 *    that ships with the model), with shadows enabled.
 */
export default function HogwartsModel({ footprint = 92 }) {
  const { scene } = useGLTF(MODEL_URL, false, true)

  const { root, scale, offset } = useMemo(() => {
    // Clone before measuring: the cached GLTF scene may still be parented to a
    // previous (scaled) wrapper during HMR remounts, and setFromObject works in
    // world space — an unparented clone guarantees a local-space measurement.
    const root = scene.clone(true)
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = footprint / Math.max(size.x, size.z)
    const off = [-center.x * s, -box.min.y * s, -center.z * s]

    const warmGlow = new THREE.MeshPhysicalMaterial({
      color: '#3a2408',
      emissive: '#ffb347',
      emissiveIntensity: 2.4,
      roughness: 0.4,
    })
    root.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      const name = (o.material?.name || '').toUpperCase()
      if (name.startsWith('LUZ') || name.startsWith('VIDRO')) {
        // Window light planes / glass panes → glowing candlelight
        o.material = warmGlow
        o.castShadow = false
      } else if (o.material) {
        // Transmission is expensive and pointless at night; disable if present
        if ('transmission' in o.material && o.material.transmission > 0) {
          o.material.transmission = 0
        }
        o.material.envMapIntensity = 0.7
        if (o.material.map) o.material.map.anisotropy = 8
      }
    })
    return { root, scale: s, offset: off }
  }, [scene, footprint])

  return (
    <group position={offset} scale={scale}>
      <primitive object={root} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)
