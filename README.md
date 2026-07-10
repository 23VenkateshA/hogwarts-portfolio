# Arvind Venkatesh — A Hogwarts Portfolio

An explorable 3D Hogwarts-themed portfolio. Fly through a low-poly castle at night;
each area of the grounds reveals a section of the resume as a parchment overlay.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Controls

- **Drag** to look around · **WASD / arrow keys** to fly · **Q/E** altitude · **Shift** to sprint
- **1–5** fly to a zone · **M** toggle the Marauder's Map · **Esc** close panels
- The bottom navigation and the Marauder's Map work entirely by mouse/keyboard.

## The map (resume → castle)

| Zone | Content |
| --- | --- |
| The Great Hall | Introduction & skills |
| The Potions Dungeon | Professional experience (Capital One, Bristol Myers Squibb, L'Oréal) |
| The Library | Projects (NBA MVP Predictor, Practice Pal, Verizon Case Competition) |
| The Common Room | Campus leadership (BITS, Phi Chi Theta, Dhol Effect) |
| The Quidditch Pitch | Hobbies & interests |

## Accessibility

The **Marauder's Map** (top-right button, or `M`) is a fully text-based 2D fallback:
every zone's content in semantic HTML with headings, lists, and links, announced
properly to screen readers. The 3D canvas is `aria-hidden`; zone arrivals are
announced via an `aria-live` region. Reduced-motion users get instant travel
instead of camera flights.

## Architecture notes

- **Single source of truth:** all resume content *and* 3D zone metadata (camera
  waypoints, proximity anchors, label positions) live in `src/data/resume.js`.
  The 3D overlays and the text map render from the same objects.
- **Fully procedural scene:** the castle is built from three.js primitives — no
  external models or textures. See `lessons_learned.md` for the rendering and
  architecture lessons collected while building (read it before changing the scene).

## Stack

React 19 · Vite · three.js · @react-three/fiber · @react-three/drei · GSAP · Tailwind CSS v4
