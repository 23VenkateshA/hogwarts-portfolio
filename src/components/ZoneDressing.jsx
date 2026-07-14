import { Sparkles } from '@react-three/drei'
import { ZONES } from '../data/resume.js'
import ZoneLabel from './ZoneLabel.jsx'
import { ironMat, windowMat } from '../three/materials.js'

/** Bubbling cauldron prop marking the Potions Dungeon at the cliff base. */
function Cauldron({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]} material={ironMat()} castShadow receiveShadow>
        <cylinderGeometry args={[1.7, 1.2, 2, 14]} />
      </mesh>
      <mesh position={[0, 2.14, 0]} material={windowMat('#2dff70', 2.6)}>
        <cylinderGeometry args={[1.45, 1.45, 0.14, 14]} />
      </mesh>
      <Sparkles count={26} scale={[4, 5, 4]} position={[0, 4, 0]} size={4.5} speed={0.9} color="#7dffab" />
    </group>
  )
}

/**
 * Per-zone atmosphere anchored to the artist-built castle model: colored
 * point lights washing the relevant wing, magical sparkles, and the floating
 * zone labels. Positions are tuned to the fitted model's landmarks and travel
 * with the zone definitions in resume.js.
 */
const DRESSING = {
  'great-hall': {
    light: { position: [-11, 12, 44], color: '#ffab4a', intensity: 260, distance: 50 },
    sparkles: { position: [-11, 14, 42], scale: [26, 10, 14], color: '#ffd27a', count: 60, size: 2.8, speed: 0.4 },
  },
  dungeon: {
    // South-east of the cauldron so it front-lights the prop from the arrival viewpoint
    light: { position: [-28, 5, 28], color: '#3fff7e', intensity: 190, distance: 42 },
    sparkles: { position: [-26, 6, 21], scale: [14, 8, 14], color: '#7dffab', count: 30, size: 3.4, speed: 0.8 },
  },
  library: {
    // North-east of the keep: washes the face seen from the arrival viewpoint
    light: { position: [16, 42, -16], color: '#7fa8ff', intensity: 300, distance: 55 },
    sparkles: { position: [4, 48, -8], scale: [16, 14, 16], color: '#a8c8ff', count: 40, size: 2.6, speed: 0.3 },
  },
  'common-room': {
    light: { position: [26, 12, 36], color: '#ff8a3d', intensity: 200, distance: 45 },
    sparkles: { position: [26, 12, 32], scale: [14, 10, 14], color: '#ffb36b', count: 30, size: 2.4, speed: 0.35 },
  },
}

export default function ZoneDressing() {
  return (
    <group>
      <Cauldron position={[-26, 0, 22]} />
      {ZONES.filter((z) => z.id !== 'quidditch').map((zone) => {
        const d = DRESSING[zone.id]
        if (!d) return null
        return (
          <group key={zone.id}>
            <pointLight
              position={d.light.position}
              color={d.light.color}
              intensity={d.light.intensity}
              distance={d.light.distance}
              decay={1.8}
            />
            <Sparkles
              position={d.sparkles.position}
              scale={d.sparkles.scale}
              color={d.sparkles.color}
              count={d.sparkles.count}
              size={d.sparkles.size}
              speed={d.sparkles.speed}
            />
            <ZoneLabel zone={zone} />
          </group>
        )
      })}
    </group>
  )
}
