import * as THREE from 'three'

/**
 * Procedural PBR texture sets (albedo / normal / roughness), generated once at
 * runtime on 2D canvases — zero external assets. Each set is memoized.
 */

function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tileable value noise with octaves, sampled on a wrapped grid. */
function makeNoise(rand, size, cells) {
  const grid = new Float32Array(cells * cells)
  for (let i = 0; i < grid.length; i++) grid[i] = rand()
  const smooth = (t) => t * t * (3 - 2 * t)
  return (x, y) => {
    // x, y in [0, 1); wraps for tileability
    const gx = x * cells
    const gy = y * cells
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
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }
}

function makeFbm(rand, octaves = 4, baseCells = 8) {
  const layers = []
  for (let o = 0; o < octaves; o++) layers.push(makeNoise(rand, 0, baseCells * 2 ** o))
  return (x, y) => {
    let v = 0
    let amp = 0.5
    for (let o = 0; o < octaves; o++) {
      v += layers[o](x, y) * amp
      amp *= 0.5
    }
    return v
  }
}

function canvasFromPixels(size, fill) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  fill(img.data)
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Sobel height→normal conversion, wrapped for tileability. */
function normalCanvasFromHeight(height, size, strength = 2) {
  return canvasFromPixels(size, (data) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const l = height[y * size + ((x - 1 + size) % size)]
        const r = height[y * size + ((x + 1) % size)]
        const u = height[((y - 1 + size) % size) * size + x]
        const d = height[((y + 1) % size) * size + x]
        const nx = (l - r) * strength
        const ny = (u - d) * strength
        const nz = 1
        const len = Math.hypot(nx, ny, nz)
        const i = (y * size + x) * 4
        data[i] = ((nx / len) * 0.5 + 0.5) * 255
        data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255
        data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255
        data[i + 3] = 255
      }
    }
  })
}

function toTexture(canvas, { srgb = false, repeat = [1, 1] } = {}) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat[0], repeat[1])
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function buildSet({ size, seed, heightFn, albedoFn, roughFn, normalStrength = 2, repeat = [1, 1] }) {
  const rand = mulberry32(seed)
  const fbm = makeFbm(rand, 4, 6)
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = heightFn(x / size, y / size, fbm)
    }
  }
  const albedo = canvasFromPixels(size, (data) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x
        const [r, g, b] = albedoFn(x / size, y / size, height[idx], fbm)
        const i = idx * 4
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = 255
      }
    }
  })
  const rough = canvasFromPixels(size, (data) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x
        const v = Math.round(THREE.MathUtils.clamp(roughFn(x / size, y / size, height[idx], fbm), 0, 1) * 255)
        const i = idx * 4
        data[i] = data[i + 1] = data[i + 2] = v
        data[i + 3] = 255
      }
    }
  })
  return {
    map: toTexture(albedo, { srgb: true, repeat }),
    normalMap: toTexture(normalCanvasFromHeight(height, size, normalStrength), { repeat }),
    roughnessMap: toTexture(rough, { repeat }),
  }
}

/** Ashlar stone blocks with mortar grooves — castle walls and towers. */
function stoneHeight(x, y, fbm) {
  const rows = 6
  const cols = 4
  const ry = y * rows
  const row = Math.floor(ry)
  const offset = (row % 2) * 0.5
  const rx = x * cols + offset
  const fy = ry - row
  const fx = rx - Math.floor(rx)
  const mortarY = 0.07
  const mortarX = 0.05
  const inBlock =
    fy > mortarY && fy < 1 - mortarY && fx > mortarX && fx < 1 - mortarX
  const blockNoise = fbm(x * 0.9, y * 0.9)
  if (!inBlock) return 0.12 + blockNoise * 0.08
  // Slightly domed blocks with per-block variation
  const domeX = 1 - Math.abs(fx - 0.5) * 0.4
  const domeY = 1 - Math.abs(fy - 0.5) * 0.4
  return 0.55 + blockNoise * 0.3 + domeX * domeY * 0.12
}

const cache = {}

export function stoneTextures() {
  if (!cache.stone) {
    cache.stone = buildSet({
      size: 256,
      seed: 41,
      repeat: [3, 3],
      heightFn: stoneHeight,
      albedoFn: (x, y, h, fbm) => {
        const mottle = fbm(x * 2.3, y * 2.3)
        const base = 88 + h * 74 + (mottle - 0.5) * 42
        return [base * 0.92, base * 0.95, base * 1.1]
      },
      roughFn: (x, y, h, fbm) => 0.98 - h * 0.22 + (fbm(x * 3, y * 3) - 0.5) * 0.1,
      normalStrength: 2.6,
    })
  }
  return cache.stone
}

/** Rough rock — plateau flanks, mountains. */
export function rockTextures() {
  if (!cache.rock) {
    cache.rock = buildSet({
      size: 256,
      seed: 97,
      repeat: [4, 4],
      heightFn: (x, y, fbm) => fbm(x, y) * 0.8 + fbm(x * 3.7, y * 3.7) * 0.2,
      albedoFn: (x, y, h) => {
        const base = 52 + h * 60
        return [base * 0.9, base * 0.96, base * 1.18]
      },
      roughFn: (x, y, h) => 0.97 - h * 0.1,
      normalStrength: 3.2,
    })
  }
  return cache.rock
}

/** Night grass / moor for terrain. */
export function grassTextures() {
  if (!cache.grass) {
    cache.grass = buildSet({
      size: 256,
      seed: 7,
      repeat: [8, 8],
      heightFn: (x, y, fbm) => fbm(x * 2, y * 2) * 0.5 + fbm(x * 8, y * 8) * 0.5,
      albedoFn: (x, y, h, fbm) => {
        const patch = fbm(x * 1.3, y * 1.3)
        const g = 46 + h * 34 + patch * 18
        return [g * 0.55, g, g * 0.62]
      },
      roughFn: () => 0.95,
      normalStrength: 1.4,
    })
  }
  return cache.grass
}

/** Planked wood — doors and stands. */
export function woodTextures() {
  if (!cache.wood) {
    cache.wood = buildSet({
      size: 256,
      seed: 23,
      heightFn: (x, y, fbm) => {
        const plank = x * 5
        const gap = plank - Math.floor(plank) < 0.06 ? 0 : 0.6
        const grain = Math.sin((y * 24 + fbm(x * 2, y * 0.4) * 5) * Math.PI) * 0.5 + 0.5
        return gap * (0.5 + grain * 0.3 + fbm(x * 4, y * 1.2) * 0.2)
      },
      albedoFn: (x, y, h, fbm) => {
        const tone = 46 + h * 46 + (fbm(x * 1.5, y * 0.5) - 0.5) * 22
        return [tone * 1.18, tone * 0.82, tone * 0.55]
      },
      roughFn: (x, y, h) => 0.9 - h * 0.25,
      normalStrength: 2.2,
    })
  }
  return cache.wood
}

/** Gentle water ripple normals for the Black Lake. */
export function waterNormals() {
  if (!cache.water) {
    const rand = mulberry32(311)
    const fbm = makeFbm(rand, 4, 10)
    const size = 256
    const height = new Float32Array(size * size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        height[y * size + x] = fbm(x / size, y / size)
      }
    }
    cache.water = toTexture(normalCanvasFromHeight(height, size, 1.2), { repeat: [6, 6] })
  }
  return cache.water
}
