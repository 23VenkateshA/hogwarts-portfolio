import { EffectComposer, SSAO, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/**
 * Cinematic post-processing stack:
 *  - SSAO darkens creases and geometry intersections (needs the normal pass).
 *  - Bloom with a strict luminance threshold so only emissive sources glow.
 *  - Vignette pulls the eye to the center.
 *  - ACES filmic tone mapping as the final color grade (the scene renders HDR
 *    into the composer's buffers, so tone mapping happens exactly once, here).
 */
export default function Effects() {
  return (
    <EffectComposer enableNormalPass multisampling={4} stencilBuffer={false}>
      <SSAO
        samples={16}
        rings={6}
        radius={0.08}
        intensity={26}
        bias={0.025}
        luminanceInfluence={0.6}
        distanceScaling
        depthAwareUpsampling
        worldDistanceThreshold={110}
        worldDistanceFalloff={12}
        worldProximityThreshold={0.4}
        worldProximityFalloff={0.12}
        resolutionScale={0.75}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={1.0}
        luminanceSmoothing={0.15}
        intensity={1.15}
        radius={0.72}
        levels={8}
      />
      <Vignette offset={0.24} darkness={0.82} eskil={false} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
