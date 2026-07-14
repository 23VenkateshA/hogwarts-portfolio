import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const labelPos = new THREE.Vector3()
const labelScreen = new THREE.Vector3()
const labelNDC = new THREE.Vector2()

/**
 * Floating golden zone label rendered in-world.
 * Visibility is managed manually (drei's `occlude` proved unreliable here):
 * a throttled raycast hides the label when geometry blocks it or the camera
 * is too far away. Only meshes occlude — sparkle Points are ignored, and hits
 * near the label itself (its own building) don't count as occlusion.
 */
export default function ZoneLabel({ zone }) {
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
