# Lessons Learned — Hogwarts 3D Portfolio

Architectural decisions and 3D rendering lessons, one entry each, one-line summary first.
Check this file before making structural changes.

## Procedural geometry beats GLTF assets for this scope
**Summary:** The whole castle is built from three.js primitives (boxes, cylinders, cones, tori) — no external models, textures, or font files.
No network/asset-pipeline dependency, tiny bundle, and low-poly primitives with `flatShading` already read as the intended "stylized Hogwarts" aesthetic. Pitched roofs are long boxes rotated 45° about their long axis (upper half reads as a ridge roof; lower half hides inside the walls).

## 45°-box roofs MUST be shorter than the walls beneath them
**Summary:** A rotated roof box the same length as (or longer than) its building pokes its huge unlit diamond end-cap through the facade — up close it renders as a screen-filling black void.
Confirmed twice (Great Hall, then again on the Dungeon): keep roof length ~1 unit less than wall length so end caps hide inside the building. Check every new diamond roof against this.

## Zone camera waypoints must sit INSIDE their zone's proximity radius
**Summary:** After a fly-to arrival, the free-flight proximity check keeps running; if the waypoint is outside the zone's `radius`, the check reports "no zone" ~0.25 s later and auto-closes the overlay that just opened.
Caught because three of five zones (dungeon, library, common room) had waypoint→anchor horizontal distances greater than their radius. When adding or moving a waypoint, verify `hypot(cam.x−anchor.x, cam.z−anchor.z) < radius`.

## drei Html `occlude` was unreliable here — self-managed raycast works
**Summary:** `<Html occlude>` never toggled visibility in this scene (zIndex updates proved its update block ran, yet labels stayed visible through walls); replaced with a throttled manual raycast per label.
Rules that made it correct: only `isMesh` hits occlude (Sparkles/Stars are Points and must not), and hits within ~18 units of the label are ignored — otherwise a zone's own roof occludes its own label, since sight-lines from below always clip the building the label floats over. Labels must also sit above their building's roofline (roof apex for a 45° box roof = wallTop + width/√2).

## Hidden browser tabs freeze the entire R3F + GSAP stack
**Summary:** In a backgrounded tab, rAF never fires — R3F's Canvas never even mounts its children (its ResizeObserver measurement is frame-aligned) and GSAP tweens freeze at progress 0.
For headless/preview verification: take a screenshot first (activates the tab so Canvas mounts), then drive time manually via a dev-only hook — `gsap.globalTimeline.getChildren(true, true, false).forEach(t => t.progress(1))` completes flights (onComplete fires), and R3F's `state.advance(t)` renders frames. `window.__hogwarts` (dev-only, set in CameraRig) exposes `{ camera, gsap, advance, scene, THREE }` for this.

## Single data module drives 3D zones, overlays, and the accessible map
**Summary:** `src/data/resume.js` is the one source of truth — each zone carries its resume content *and* its 3D metadata (camera waypoint, proximity anchor + radius, label position).
The parchment overlay, the Marauder's Map text fallback, and the fly-through all render from the same objects, so resume edits happen in exactly one place and the 2D fallback can never drift out of sync with the 3D scene.

## GSAP fly-through: tween position and a lookAt point, then resync yaw/pitch
**Summary:** Camera travel tweens `camera.position` and a separate `lookPoint` Vector3 (with `camera.lookAt(lookPoint)` in `onUpdate`); on complete, yaw/pitch refs are re-derived from the final gaze direction.
Free flight uses yaw/pitch Euler refs (`rotation.order = 'YXZ'`). Mixing the two only works if you hand orientation state back after every tween: `pitch = asin(dir.y)`, `yaw = atan2(-dir.x, -dir.z)`. Before starting a tween, seed `lookPoint` from `camera.getWorldDirection()` so the gaze tween starts from the current view without snapping. `prefers-reduced-motion` sets tween duration to 0 — GSAP still fires `onComplete`, so arrival logic stays on one code path.

## Overlay reveals are proximity-driven, checked ~4×/sec, edge-triggered
**Summary:** A throttled check in `useFrame` finds the zone whose 2D distance/radius ratio is best and <1; the callback fires only when the winner *changes*.
Edge-triggering means closing a panel while still inside a zone doesn't instantly reopen it, and zone radii can overlap safely. Zone radii must be large enough to contain their own camera waypoint or the overlay state gets inconsistent right after arrival.

## Keyboard focus vs. WASD flight needs explicit rules
**Summary:** Camera keys are accepted unless focus is in a form control or a `[role="dialog"]`; nav buttons blur themselves on click; only explicit fly-to arrivals (not proximity reveals) auto-focus the overlay.
Without these three rules you get: WASD dead after clicking a nav button, held movement keys dying when a proximity overlay steals focus, and Space both scrolling/activating buttons and moving the camera. Also clear the pressed-keys map on window `blur` or keys stick.

## Lighting budget: 5 point lights + emissive `toneMapped={false}` windows
**Summary:** Atmosphere comes from ambient + one directional moonlight + one point light per zone; all windows/flames are emissive meshes with `toneMapped={false}` so they bloom past the ACES tonemapper.
Dozens of real lights would tank the frame rate; emissive-heavy, light-poor is the perf-safe way to fake "hundreds of candles". Floating candles are two `InstancedMesh`es (wax + flames) sharing one seed array — 40 candles, 2 draw calls. `frustumCulled={false}` on instanced meshes whose matrices move, or they vanish at screen edges.

## Zone waypoints: frame tall structures from ~1.2× their height in distance
**Summary:** A camera waypoint aimed at the middle of a tall tower from close range shows only a dark shaft filling the frame; every zone's hero shot needed distance ≈ 1.2–1.5× the subject's height, aimed near the subject's visual center of interest.
Library tower (33 units tall) needed a 43-unit standoff; the Quidditch pitch needed an elevated side-on view instead of a view from behind its own goal hoops. After moving any waypoint, re-verify the proximity-radius rule above — framing pulls waypoints outward, and radii must grow with them.

## R3F `advance()` takes rAF-style millisecond timestamps
**Summary:** When driving frames manually, pass `performance.now() + i * 16` (milliseconds); passing seconds makes the internal clock go backward and deltas collapse to ~0, silently freezing all `useFrame` movement.

## HMR remounts re-fire the fly-to effect
**Summary:** After a hot update of CameraRig, the effect keyed on `flyRequest` re-runs with the last request and re-flies the camera (and in a hidden tab, leaves `flying=true` frozen, blocking WASD).
Harmless in real use — the tween just replays — but during dev-tool verification, always re-trigger the intended flight after any HMR/reload rather than trusting prior camera state.

## Environment quirk (macOS, this machine)
**Summary:** No `pdftoppm`/poppler installed, so the Read tool can't render PDFs — extract PDF text with `pypdf` installed to the scratchpad instead.
