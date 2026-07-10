import * as THREE from 'three'
import { stoneTextures, rockTextures, grassTextures, woodTextures, waterNormals } from './textures.js'

/**
 * Shared MeshPhysicalMaterial instances — one per surface family so hundreds of
 * meshes reuse a handful of shader programs. All PBR maps are procedural.
 */

const cache = {}

function physical(key, make) {
  if (!cache[key]) cache[key] = make()
  return cache[key]
}

export const stoneMat = () =>
  physical('stone', () => {
    const t = stoneTextures()
    return new THREE.MeshPhysicalMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      color: '#79829f',
      roughness: 1,
      envMapIntensity: 0.5,
    })
  })

export const stoneDarkMat = () =>
  physical('stoneDark', () => {
    const m = stoneMat().clone()
    m.color = new THREE.Color('#6a7292')
    return m
  })

export const roofMat = () =>
  physical('roof', () => {
    const t = rockTextures()
    return new THREE.MeshPhysicalMaterial({
      map: t.map,
      normalMap: t.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      color: '#2a3354',
      roughness: 0.75,
      clearcoat: 0.25,
      clearcoatRoughness: 0.6,
      envMapIntensity: 0.7,
    })
  })

export const rockMat = () =>
  physical('rock', () => {
    const t = rockTextures()
    return new THREE.MeshPhysicalMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      color: '#7d88ad',
      roughness: 1,
      envMapIntensity: 0.4,
    })
  })

export const grassMat = () =>
  physical('grass', () => {
    const t = grassTextures()
    return new THREE.MeshPhysicalMaterial({
      map: t.map,
      normalMap: t.normalMap,
      color: '#5e7d70',
      roughness: 1,
      envMapIntensity: 0.35,
    })
  })

export const pitchGrassMat = () =>
  physical('pitchGrass', () => {
    const m = grassMat().clone()
    m.color = new THREE.Color('#a3cfae')
    m.envMapIntensity = 0.6
    // Faint self-illumination so the far half of the oval reads as moonlit turf
    m.emissive = new THREE.Color('#0e2016')
    m.emissiveIntensity = 0.55
    return m
  })

export const woodMat = () =>
  physical('wood', () => {
    const t = woodTextures()
    return new THREE.MeshPhysicalMaterial({
      map: t.map,
      normalMap: t.normalMap,
      roughnessMap: t.roughnessMap,
      color: '#9a7a58',
      roughness: 0.9,
      envMapIntensity: 0.5,
    })
  })

export const lakeMat = () =>
  physical('lake', () => {
    return new THREE.MeshPhysicalMaterial({
      color: '#0e2740',
      normalMap: waterNormals(),
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.08,
      metalness: 0.35,
      envMapIntensity: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    })
  })

export const goldMat = () =>
  physical('gold', () => {
    return new THREE.MeshPhysicalMaterial({
      color: '#d8b25f',
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.4,
      emissive: '#8a6a20',
      emissiveIntensity: 0.25,
    })
  })

export const ironMat = () =>
  physical('iron', () => {
    return new THREE.MeshPhysicalMaterial({
      color: '#22262f',
      metalness: 0.85,
      roughness: 0.45,
      envMapIntensity: 0.9,
    })
  })

export const waxMat = () =>
  physical('wax', () => {
    return new THREE.MeshPhysicalMaterial({
      color: '#efe4c8',
      roughness: 0.55,
      sheen: 0.6,
      sheenColor: new THREE.Color('#fff3d0'),
      emissive: '#5a4a28',
      emissiveIntensity: 0.35,
      envMapIntensity: 0.5,
    })
  })

export const treeMat = () =>
  physical('tree', () => {
    return new THREE.MeshPhysicalMaterial({
      color: '#18291f',
      roughness: 1,
      envMapIntensity: 0.25,
    })
  })

export const bannerClothMat = (colorHex) =>
  physical(`cloth-${colorHex}`, () => {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      roughness: 0.92,
      sheen: 0.5,
      sheenColor: new THREE.Color('#c8b6a0'),
      side: THREE.DoubleSide,
      envMapIntensity: 0.5,
    })
  })

/** Glowing window panes: bright emissive so the Bloom threshold catches them. */
export const windowMat = (colorHex, intensity = 3.2) =>
  physical(`window-${colorHex}-${intensity}`, () => {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: intensity,
      roughness: 0.4,
    })
  })
