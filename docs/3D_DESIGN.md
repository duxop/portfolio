# 3D design

How the two hero scenes are built: the shared skeleton, the camera and lights, each scene's cast and keyframes, the performance budget, and the spike that proves it on a phone. [`UI_DESIGN.md`](UI_DESIGN.md) §5 is the storyboard: what the visitor sees at each scroll position. This file is the scene design: what exists, how many, where, and how it moves. [`ARCHITECTURE.md`](ARCHITECTURE.md) §3 says when a scene loads. Where this file and a newer ADR disagree, the ADR wins.

**Status: Approved**, 2026-10-09. Written by Claude, approved by me the same day, after the decisions of 2026-10-09: a separate 3D design doc; both scenes from three.js primitives, with no Blender ([ADR 0010](adr/0010-hero-scenes-from-primitives.md)); one scroll trigger and one frame loop, with every instance interpolated between keyframes ([ADR 0011](adr/0011-scroll-driven-scene-animation.md)); no text inside a scene. Every number in §3 to §5 is a _proposal_: it fixes the composition well enough to build from, and gets tuned in the browser on the M4 and M5 tickets. The targets in §6 are replaced by the spike's measurements.

## 1. Goals and non-goals

| #   | Goal                                       | Metric                                                                                                            | Checked                                 |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| G1  | Each scene tells its story without words   | Someone who hasn't read the storyboard looks at the still and says, in their own words, that a mess becomes order | The M4 and M5 demos                     |
| G2  | Cheap enough for a mid-range Android phone | Frame rate during the scroll at or above the spike's target; draw calls, triangles and lights within §6           | The spike, then M4 and M5 on that phone |
| G3  | Nothing in the hero waits for the 3D       | The headline is the LCP element while the chunk loads; the image-to-canvas swap adds 0 to CLS                     | Lighthouse on the M4 preview            |
| G4  | Zero model bytes                           | No `.glb` in the repo. The 1.5 MB model budget (PRD NFR-1) is a ceiling nothing uses                              | The M4 build output                     |

**Non-goals.** No textures, no shadows, no post-processing, no physics, no Blender, no text inside the canvas, no scene outside the hero. Each would cost bytes, frames or learning time, and the storyboard needs none of them.

## 2. The shared skeleton

Both scenes are the same program fed different data: a cast of instanced primitives, a camera, two lights, a scroll trigger that reports progress, and one frame loop that puts every instance where the keyframes say it should be at that progress.

### 2.1 Stack

| Package               | Version, checked 2026-10-08 | Job                                                                                                                                |
| --------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `three`               | 0.186.1                     | Geometries, materials, lights, the renderer                                                                                        |
| `@react-three/fiber`  | 9.8.1                       | three.js as React components, and the frame loop                                                                                   |
| `gsap`, `@gsap/react` | 3.15.0, 2.1.2               | ScrollTrigger pins the hero and reports progress; `useGSAP` cleans up on unmount                                                   |
| `@types/three`        | 0.186.0                     | Types                                                                                                                              |
| `@react-three/drei`   | 10.7.9                      | Helpers. Not needed by this design; added only if the spike or M4 reaches for one, such as `PerformanceMonitor` (open question Q2) |

Peer ranges fit: fiber 9 needs React 19 below 19.4, and `apps/web` has 19.2.8; drei 10 needs fiber 9 and three 0.159 or newer. Versions are re-checked at the spike's install step.

### 2.2 Files (proposal for M4)

| File                                                     | Job                                                                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `components/three/hero-scene.tsx`                        | Client. The gates (WebGL, reduced motion, theme), the lazy import of the current theme's scene, and the still-to-canvas swap |
| `components/three/scene-canvas.tsx`                      | The canvas with the settings in §2.3 and the camera in §3. The lights belong to each scene                                   |
| `components/three/crusher-scene.tsx`, `clinic-scene.tsx` | The cast as instanced meshes and groups, the two lights, and one frame loop each                                             |
| `components/three/crusher.data.ts`, `clinic.data.ts`     | Counts, colours, start poses and keyframes as typed data (§4, §5)                                                            |
| `components/three/use-scroll-progress.ts`                | The one ScrollTrigger: pins the hero, writes progress into a ref, asks for a frame                                           |
| `lib/keyframes.ts`                                       | Pure: the pose at progress `p` from a keyframe list, with stagger (§2.6). Unit-tested                                        |
| `public/hero-crusher.avif`, `hero-clinic.avif`, `.webp`  | The stills (§2.8)                                                                                                            |

### 2.3 Canvas settings

| Setting       | Value                                                      | Why                                                                                        |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Background    | Transparent; no floor                                      | The page background shows through, so the scene sits on the page in either theme           |
| Pixel ratio   | A range: 1 to 1.5 below 768 px wide, 1 to 2 above          | NFR-1. The canvas's `dpr` prop takes a `[min, max]` range                                  |
| Frame loop    | On demand: a frame is drawn only when one is asked for     | Battery, and the pause rules below. `frameloop="demand"`                                   |
| Antialias     | On                                                         | Flat-shaded edges alias badly without it. The spike measures what it costs (assumption A3) |
| Shadows       | Off                                                        | The storyboard: flat shading only                                                          |
| Tone mapping  | Off (the canvas's `flat` prop)                             | So a token hex comes out as that colour on the unlit accents, not a filmic version of it   |
| Colour        | three.js's default colour management; token hex as written | The default since r152                                                                     |
| `aria-hidden` | On the canvas                                              | Its meaning is in the still's alt text and the headline (UI_DESIGN §5.3)                   |

**Who asks for a frame.** Two sources: the scroll trigger, each time progress changes; and an idle ticker that runs only while the hero is on screen (an IntersectionObserver) and the tab is visible (`visibilitychange`). So with no scrolling, the hero off screen, or the tab hidden, nothing is drawn (UI_DESIGN §3.5).

### 2.4 Loading, swapping and failing

1. The HTML has a `<picture>` with the current theme's still and its alt text from UI_DESIGN §5, in a slot with a fixed 4:3 ratio (UI_DESIGN §4.1).
2. After hydration, if WebGL is available and reduced motion is off, the current theme's scene chunk is imported with `next/dynamic` and `ssr: false` (ARCHITECTURE §3). The canvas mounts behind the picture. After its first frame, the picture fades out over 200 ms. There is one chunk per scene, so the other theme's scene costs nothing until it's wanted.
3. If the import fails or WebGL fails to start, the picture stays. Nothing else changes.
4. On a theme switch, the mounted scene unmounts, which disposes its geometries and materials, and the picture swaps at once. If the visitor stays on the new theme for 1.5 s, that theme's scene loads the same way. One scene is ever in memory (UI_DESIGN §5.3).

The WebGL check is a `webgl2` context created on a throwaway canvas; `null` means no WebGL.

### 2.5 The frame loop contract

One `useFrame` per scene. Its inputs are the progress ref (0 to 1) and the elapsed time from the canvas clock, which only advances while frames are being drawn. Each frame it:

1. Computes the camera's position from its two keys (§3) and points it at the look-at point.
2. For each instanced mesh: for every instance, computes the pose for this progress (§2.6), adds the idle offset (§4.4, §5.4), writes it into a reused dummy object, copies the dummy's matrix into the instance, then marks the instance buffer for upload once per mesh.
3. Scales the one-offs (the "now serving" block, the tokens) the same way, as single meshes.

Rules, from the audit list in `CLAUDE.md`: every vector, matrix and dummy is created once, outside the loop; no React state is set inside it; the buffer is marked once per mesh per frame, not once per instance. The three.js `InstancedMesh` page covers `setMatrixAt` and `instanceMatrix.needsUpdate`.

### 2.6 Keyframes

A pose is a position, a rotation and a scale. A keyframe is a progress value and a pose. Each instance has a short list of keyframes, and its pose at progress `p` is found like this:

- Before the first key: the first pose. After the last: the last pose.
- Between two keys: each component is interpolated with smoothstep (`MathUtils.smoothstep`), so every move eases in and out, and scrubbing backwards plays it in reverse.
- Stagger: instance `i` of `N` adds `δ = span × i / N` to every key after the first, with `span` set per group (0.06 to 0.10 below). The instances are shuffled with the seed first, so neighbours don't march in order.

The keyframe tables in §4.3 and §5.3 use the scroll bands from UI_DESIGN §5: 0 to 0.35, 0.35 to 0.65, 0.65 to 0.90, 0.90 to 1.

**Seeded randomness.** Every "random" position, rotation, phase and shuffle comes from a small seeded generator, so the scene is the same on every load, and the still (§2.8) matches what the visitor sees. Search: `seeded random javascript mulberry32`. It's a few lines and no dependency.

### 2.7 Materials and colour

| Use                              | Material                   | Settings                                                                                                   |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Everything lit                   | Standard                   | Flat shading on, roughness 1, metalness 0. One material per instanced mesh, shared, never cloned per frame |
| Accents that must stay saturated | Basic (unlit)              | The crusher's `signal` edge, the clinic desk's `clinic` edge, the "now serving" block, the tokens          |
| Per-instance colour              | The instance colour buffer | Rocks in two tones, patients in two tones, the one `signal` bar                                            |

Every colour is a token hex from `CLAUDE.md`. Light colours are not tokens: they tint the token colours, and the pairs in §3 are a starting point for the lab.

### 2.8 The still

One image per theme, rendered from the real scene at progress 1 (UI_DESIGN §5.3, "from M4 onward"). On the M4 and M5 branches, a temporary lab page renders the scene at 1600 × 1200 with `preserveDrawingBuffer` on and exports the canvas with `toDataURL`. The PNG is converted once to AVIF and WebP at 80 kB or less each, and the lab page is deleted before the PR. Until M4, the still is the SVG composition from the design canvas (UI_DESIGN §5.3).

## 3. Camera, world and lights

**World.** One unit is about a metre. `y` is up, `x` runs left to right across the screen, `z` comes toward the camera. Both scenes fit in a box 12 wide, 6 high and 8 deep, centred near the origin. The hero slot is 4:3 (UI_DESIGN §4.1).

**Camera**, the same in both scenes so they read as a pair (UI_DESIGN §5.2).

| Property               | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| Type                   | Perspective, vertical field of view 35°, near 0.5, far 50 |
| Position at progress 0 | (7, 5, 9)                                                 |
| Position at progress 1 | (6.3, 4.5, 8.1): about 10 % closer                        |
| Look-at, constant      | (0, 1.2, 0)                                               |
| Interpolation          | Smoothstep over the whole scroll, 0 to 1                  |

At 4:3 this shows about 7.6 units of height and 10 of width at the look-at point, which is about 12 units away.

**Lights.** Two per scene, no shadows. The crusher's are the storyboard's "dusk"; the clinic's are its ceiling light.

| Scene          | Key                                                                                        | Fill                                                               |
| -------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Crusher (dark) | Directional, warm `#FFC79A`, intensity 2.0, from (−6, 8, 4): upper left, slightly in front | Hemisphere, sky cool `#6E7A8A`, ground `basalt-950`, intensity 0.5 |
| Clinic (light) | Directional, white, intensity 1.6, from (0, 10, 3): straight above, slightly in front      | Hemisphere, sky white, ground `chalk-200`, intensity 0.8           |

Light intensities in three.js have been physically based since r155, so these are starting points for the lab, not final values.

## 4. Scene A: the crusher (dark theme)

Storyboard: UI_DESIGN §5.1.

### 4.1 Cast

| Group             | Count | Geometry                                                                                                                                                  | Colour                                                                                                 | Draw calls    |
| ----------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| Rocks             | 40    | Icosahedron, radius 1, detail 0; instance scales 0.42, 0.30 and 0.20 (14, 14 and 12 of each)                                                              | `stone-600` and `stone-400`, 60/40, per instance                                                       | 1 (instanced) |
| Spreadsheet cells | 24    | Plane 0.70 × 0.40                                                                                                                                         | `basalt-900`                                                                                           | 1 (instanced) |
| Cell outlines     | 24    | Plane 0.78 × 0.48, the same pose as its cell, 0.01 behind it along the cell's normal                                                                      | `stone-600`                                                                                            | 1 (instanced) |
| Paper challans    | 16    | Plane 0.45 × 0.60                                                                                                                                         | `stone-100`                                                                                            | 1 (instanced) |
| Output boxes      | 30    | Box 1 × 1 × 1; instance scale 0.30 on the belt, slot scales in the dashboard (§4.2)                                                                       | `stone-400`; the box that becomes bar 4 is `signal`; the one that becomes the stat card is `stone-100` | 1 (instanced) |
| Hopper            | 1     | Cylinder: top radius 1.4, bottom radius 0.55, height 1.2, 4 radial segments, turned 45° about `y` so its faces are square to the axes; centre (0, 2.1, 0) | `stone-400`                                                                                            | 1             |
| Hopper edge       | 1     | Cylinder: both radii 1.45, height 0.08, 4 segments, the same turn; at `y` 2.7                                                                             | `signal`, unlit                                                                                        | 1             |
| Jaw box           | 1     | Box 2.2 × 1.5 × 1.6, centre (0, 0.75, 0); its top meets the hopper's bottom                                                                               | `stone-600`                                                                                            | 1             |
| Belt              | 1     | Box 3.4 × 0.12 × 0.9, centre (2.5, 0.30, 0)                                                                                                               | `stone-600`                                                                                            | 1             |
| Rollers           | 2     | Cylinder radius 0.18, length 1.0, 8 segments, axis along `z`; at `x` 0.9 and 4.1, `y` 0.30                                                                | `stone-400`                                                                                            | 1 (instanced) |

Ten draw calls, 134 instances, about 1,400 triangles (rocks 800, boxes 360, the rest under 250). The challans' ruled lines are left out: a plain `stone-100` plane reads as paper against basalt (assumption A5). If it doesn't in review, three thin `stone-400` strips per challan go in as one more instanced mesh.

### 4.2 Where things are

**Raw, progress 0.** Rocks, cells and challans scatter in a volume to the left of and above the crusher: `x` from −5 to −1, `y` from 1 to 4.5, `z` from −2 to 2, each with a random rotation. The crusher, belt and rollers are where §4.1 puts them. The output boxes sit at the outlet at scale 0, invisible.

**The mouth.** A point just above the hopper's rim, (0, 3.1, 0), plus a random offset of up to 0.6 in `x` and `z`, so the pieces don't converge on one pixel.

**The outlet.** The middle of the jaw box's right face, (1.2, 0.45, 0), where the boxes appear.

**The belt's end.** (3.9, 0.45, 0).

**The dashboard.** A group at (3.2, 1.9, 1.2), turned about `y` to face the camera: a yaw of about 26°, from `atan2(7 − 3.2, 9 − 1.2)`. Its slots, in the group's own space, 2.4 wide by 2.0 tall:

```
  y
 1.6 ┌────────────────────────────────┐
     │  ▭ ▭ ▭ ▭ ▭ ▭    table          │  4 rows × 6 columns, pitch 0.36
     │  ▭ ▭ ▭ ▭ ▭ ▭                   │  cell scale (0.30, 0.14, 0.08)
     │  ▭ ▭ ▭ ▭ ▭ ▭                   │
 0.5 │  ▭ ▭ ▭ ▭ ▭ ▭                   │
     │                                │
     │  ▌▌▌█▌   bars      ┌────────┐  │  5 bars, pitch 0.36, heights 0.35 0.60 0.50 0.90 0.70
     │  ▌▌▌█▌             │  stat  │  │  bar scale (0.26, height, 0.10); bar 4 is signal
-0.4 │  ▌▌▌█▌             └────────┘  │  stat card scale (0.80, 0.50, 0.08), centre (0.7, 0.0)
     └────────────────────────────────┘
      x −1.2                         1.2
```

### 4.3 Keyframes

**Raw pieces.** Rocks, cells and challans share one list (span 0.10). `S` is the scatter pose and `M` the mouth point with its offset.

| Progress | Position    | Rotation   | Scale | Reads as                                                |
| -------- | ----------- | ---------- | ----- | ------------------------------------------------------- |
| 0        | `S`         | random `R` | `s`   | Raw, drifting (§4.4); the drift is gone by 0.10         |
| 0.35 + δ | `M`         | `R`        | `s`   | Converging on the mouth                                 |
| 0.50 + δ | (0, 1.6, 0) | `R`        | 0     | Swallowed by the hopper; the last piece is gone by 0.60 |

**Output boxes** (span 0.08). `D` is the box's slot from §4.2, in world space.

| Progress | Position   | Rotation      | Scale      | Reads as                                                               |
| -------- | ---------- | ------------- | ---------- | ---------------------------------------------------------------------- |
| 0        | outlet     | 0             | 0          | Hidden                                                                 |
| 0.40 + δ | outlet     | 0             | 0.30       | Pops out of the jaw                                                    |
| 0.62 + δ | belt's end | 0             | 0.30       | Rides the belt; the stagger spreads the boxes along it                 |
| 0.85 + δ | `D`        | dashboard yaw | slot scale | Snaps into the table, the bars and the stat card; the last one by 0.93 |

**Camera:** §3. Nothing else moves. Optional, if the "through" band feels static in review: the jaw box rocks ±2° about `z` at 1.5 Hz between 0.35 and 0.65, and the rollers turn.

### 4.4 Idle

While frames are being drawn (§2.3), each raw piece adds `0.08 × sin(0.8 t + φ)` to its `y` and turns about `y` at 0.15 rad/s, where `φ` is a seeded phase per instance. The amplitude is multiplied by `1 − smoothstep(0, 0.10, p)`, so the drift has stopped before the pieces start toward the mouth.

## 5. Scene B: the clinic (light theme)

Storyboard: UI_DESIGN §5.2, with the two amendments of 2026-10-09: the wall screen shows a `clinic` block and rows instead of words, and each seated patient holds a `clinic` token card instead of a number.

### 5.1 Cast

| Group               | Count | Geometry                                                              | Colour                                                                           | Draw calls    |
| ------------------- | ----- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| Papers              | 30    | Plane 0.30 × 0.40                                                     | `stone-100`                                                                      | 1 (instanced) |
| Heads               | 12    | Icosahedron, radius 0.17, detail 1                                    | Staff `clinic`; patients `stone-400` and `stone-600`, five of each, per instance | 1 (instanced) |
| Bodies              | 12    | Cone, radius 0.24, height 0.75, 6 radial segments                     | The same as the head above it                                                    | 1 (instanced) |
| Chair seats         | 8     | Box 0.45 × 0.08 × 0.45, at `y` 0.42 of the chair                      | `stone-400`                                                                      | 1 (instanced) |
| Chair backs         | 8     | Box 0.45 × 0.45 × 0.06, at `y` 0.68 and `z` −0.20 of the chair        | `stone-400`                                                                      | 1 (instanced) |
| Tokens              | 8     | Box 0.12 × 0.16 × 0.02                                                | `clinic`, unlit                                                                  | 1 (instanced) |
| Desk                | 1     | Box 2.6 × 0.9 × 0.9, centre (−1.6, 0.45, 0.8)                         | `stone-100`                                                                      | 1             |
| Desk edge           | 1     | Box 2.6 × 0.06 × 0.06 along the desk's front top edge                 | `clinic`, unlit                                                                  | 1             |
| Wall screen         | 1     | Box 2.6 × 1.6 × 0.10, centre (1.2, 2.2, −2.6), facing +`z`            | `basalt-900`                                                                     | 1             |
| "Now serving" block | 1     | Box 0.9 × 0.5 × 0.03 on the screen's face, centre (0.75, 2.70, −2.54) | `clinic`, unlit                                                                  | 1             |

Ten draw calls, 78 instances, about 1,500 triangles (heads 960, chairs 190, the rest under 350). A person is a head instance and a body instance sharing one pose: the body's centre at `y` 0.375 and the head at `y` 0.95 above the person's feet.

### 5.2 Where things are

**Chaos, progress 0.** Papers scatter in `x` −3 to 3, `y` 0.9 to 3.4, `z` −2 to 1.5, with random rotations. People stand at random points in `x` −3 to 3, `z` −1.2 to 2.2, facing random directions. Chairs lie scattered in `x` −0.5 to 3, `z` 0.5 to 2.5, at random yaws. The screen is blank: the block and the tokens are at scale 0.

**The screen's rows.** Six rows on the screen's face (`z` −2.55), at `y` 2.25, 2.10, 1.95, 1.80, 1.65 and 1.50, below the block. Each row is four papers side by side at `x` 0.375, 0.925, 1.475 and 2.025, each scaled to (1.8, 0.30, 1), so four make one strip 2.2 wide. That takes 24 of the 30 papers.

**The desk stack.** The other six papers lie flat on the desk at (−1.6, 0.92 + 0.02 k, 0.8), turned −90° about `x`.

**The chair row.** Eight chairs at `x` 0.4 + 0.55 c for c from 0 to 7, `z` 1.4, turned to face the screen, so their backs are toward the camera.

**Seats and the desk.** Eight patients sit on the chairs: the seated pose is the chair's position with `y` lowered by 0.22 and the body's `y` scale 0.7. Two patients stand at the desk's front, (−2.0, 0, 1.5) and (−1.2, 0, 1.5), facing the desk. The two staff stand behind it, (−2.2, 0, 0.1) and (−1.0, 0, 0.1), facing the room.

### 5.3 Keyframes

**Papers to the screen**, 24 of 30 (span 0.10).

| Progress | Position     | Rotation                   | Scale          | Reads as                                              |
| -------- | ------------ | -------------------------- | -------------- | ----------------------------------------------------- |
| 0        | `S`          | random                     | 1              | Chaos, fluttering (§5.4); the flutter is gone by 0.12 |
| 0.35 + δ | `S`          | 0, facing the screen's way | 1              | Turning toward the screen                             |
| 0.60 + δ | its row slot | 0                          | (1.8, 0.30, 1) | Streaming in and becoming a row; the last one by 0.70 |

**Papers to the desk**, 6 of 30 (span 0.10).

| Progress | Position       | Rotation       | Scale | Reads as                  |
| -------- | -------------- | -------------- | ----- | ------------------------- |
| 0        | `S`            | random         | 1     | As above                  |
| 0.35 + δ | `S`            | 0              | 1     | As above                  |
| 0.72 + δ | its stack slot | −90° about `x` | 1     | The desk's one tidy stack |

**People** (span 0.06). `P` is the person's chaos position.

| Progress | Position                                     | Rotation                        | Scale                  | Reads as                             |
| -------- | -------------------------------------------- | ------------------------------- | ---------------------- | ------------------------------------ |
| 0        | `P`                                          | random yaw                      | 1                      | Hurrying: a bob (§5.4), gone by 0.12 |
| 0.35     | `P`                                          | the same                        | 1                      | Slowing down                         |
| 0.65     | `P`                                          | facing the desk                 | 1                      | Turning toward the desk              |
| 0.85 + δ | a seat, the desk's front or behind it (§5.2) | facing the screen, desk or room | 1                      | Walking to their place               |
| 0.90 + δ | the same, patients' `y` −0.22                | the same                        | patients' body `y` 0.7 | Sitting; the last one by 0.96        |

**Chairs** (span 0.06).

| Progress | Position  | Rotation          | Scale | Reads as                                   |
| -------- | --------- | ----------------- | ----- | ------------------------------------------ |
| 0        | scattered | random yaw        | 1     | Out of line                                |
| 0.65     | the same  | the same          | 1     | Still out of line                          |
| 0.82 + δ | row slot  | facing the screen | 1     | Lining up, just before the patients arrive |

**One-offs.**

| What                                                                                    | Progress            | Scale |
| --------------------------------------------------------------------------------------- | ------------------- | ----- |
| The "now serving" block                                                                 | 0.80 → 0.88         | 0 → 1 |
| A token in each seated patient's hand, at the person's position plus (0.20, 0.55, 0.15) | 0.86 + δ → 0.92 + δ | 0 → 1 |

**Camera:** §3. Dropped from the storyboard as a simplification: the files in people's hands during the chaos. The scattered papers carry the chaos (assumption A5). If the first frame reads as too calm in review, ten of the papers start beside a person and follow it until 0.35.

### 5.4 Idle

Papers: a wobble of ±0.3 rad about `x` and `z` at 1.2 Hz, and `0.06 × sin(1.2 t + φ)` on `y`. People: `0.04 × sin(6 t + φ)` on `y`, the hurry. Both are multiplied by `1 − smoothstep(0, 0.12, p)`.

## 6. Performance budget

Targets per scene, set before the spike. The spike's measurements replace the frame-rate and chunk rows, and set the initial-JavaScript budget in ARCHITECTURE §3.

| Measure                                  | Target                                                                | This design            | How it's measured                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| Draw calls                               | ≤ 15                                                                  | 10                     | `gl.info.render.calls`, printed from the lab page                                 |
| Triangles                                | ≤ 10,000                                                              | ≈ 1,500                | `gl.info.render.triangles`, the same                                              |
| Lights                                   | 2                                                                     | 2                      | By design                                                                         |
| Instances in motion                      | ≤ 160                                                                 | 134 crusher, 78 clinic | By design                                                                         |
| Frame rate while scrolling, on the phone | Set by the spike; proposal ≥ 50 fps                                   | —                      | A frame-time counter on the lab page; Chrome remote debugging's Performance panel |
| Frame rate idle, on the phone            | ≥ 55 fps, and 0 frames while paused                                   | —                      | The same; the counter stops when the tab is hidden                                |
| 3D chunk, gzipped                        | Set by the spike; assumption A2: 200 to 250 kB for three, fiber, GSAP | —                      | `next build` output and the network panel                                         |
| LCP with the chunk loading               | Within 0.2 s of LCP without it; the headline stays the LCP element    | —                      | Lighthouse mobile on the preview, both ways                                       |
| Each still                               | ≤ 80 kB                                                               | —                      | File size                                                                         |
| Model bytes                              | 0                                                                     | 0                      | No `.glb` in the repo                                                             |

## 7. The spike (stage 5)

Brief §7: time-boxed to two or three sessions, thrown away, on a branch that never merges. It builds the crusher scene's hardest part, the instanced rocks moving under scroll, and measures it on your phone. Its result applies to both scenes, since they share the camera, the light count and the cast size (UI_DESIGN §5.3). Each step is given in full, one at a time, the way `CLAUDE.md` describes; this is the outline.

| Step | What exists after it                                                                                                    | Concept learned                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1    | Branch `spike/hero-3d`. `three`, `@react-three/fiber`, `gsap`, `@gsap/react` and `@types/three` installed in `apps/web` | What each package is for                        |
| 2    | A `/lab` page: a client-only canvas with one lit box, the §3 camera, and the §3 crusher lights                          | Canvas, mesh, geometry, material, light, camera |
| 3    | 40 instanced icosahedrons in two tones, scattered by a seeded generator                                                 | Instancing; one matrix per instance             |
| 4    | The page pinned for one screen; a ScrollTrigger writes progress into a ref                                              | Pin, scrub, progress                            |
| 5    | The frame loop moves every rock from its scatter pose to a 4 × 10 grid, with smoothstep and stagger                     | The frame loop; keyframes                       |
| 6    | The pixel-ratio cap, on-demand frames, the idle drift and the pause rules                                               | Pixel ratio; asking for a frame                 |
| 7    | The preview opened on the phone; frame rate, LCP and chunk size recorded                                                | Measuring                                       |

**Exit:** `docs/spikes/hero-3d.md` with the numbers you measured, and an ADR choosing the full scene, a simpler one, or the still. If the answer changes this file or the storyboard, they're updated before M4.

## 8. Learning order

Read in this order. Each page was opened on 2026-10-08 against the versions in §2.1.

| Concept                                                                                                                       | Page                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| How a scene is put together: scene, camera, renderer, mesh, light, the render loop                                            | three.js manual, "Fundamentals": https://threejs.org/manual/#en/fundamentals (the manual's chapters render in the browser) |
| The same in React: the canvas, mesh JSX, `args`, lights                                                                       | React Three Fiber, "Your first scene": https://r3f.docs.pmnd.rs/getting-started/your-first-scene                           |
| The canvas props: `dpr`, `frameloop`, `gl`, `camera`, `flat`                                                                  | React Three Fiber, "Canvas": https://r3f.docs.pmnd.rs/api/canvas                                                           |
| The frame loop (`useFrame`) and asking for a frame (`invalidate`)                                                             | React Three Fiber, "Hooks": https://r3f.docs.pmnd.rs/api/hooks                                                             |
| Instancing, on-demand rendering, re-using geometries and materials                                                            | React Three Fiber, "Scaling performance": https://r3f.docs.pmnd.rs/advanced/scaling-performance                            |
| The instance API: `setMatrixAt`, `instanceMatrix.needsUpdate`, `setColorAt`                                                   | three.js, `InstancedMesh`: https://threejs.org/docs/#api/en/objects/InstancedMesh                                          |
| Pin, scrub and progress                                                                                                       | GSAP, ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/                                                       |
| Cleaning up GSAP in React: `useGSAP`                                                                                          | GSAP, "React": https://gsap.com/resources/React/                                                                           |
| The shapes: `IcosahedronGeometry`, `CylinderGeometry`, `ConeGeometry`, `BoxGeometry`, `PlaneGeometry`; `MathUtils.smoothstep` | The three.js docs index, Core → Geometries and Core → Math: https://threejs.org/docs/                                      |

## 9. Assumptions and open questions

**Assumptions**, marked so you look at them hardest:

- **A1** Every position, size, light and intensity in §3 to §5 is a proposal derived from the storyboard, not a measurement. The lab page is where they get tuned.
- **A2** The 3D chunk is 200 to 250 kB gzipped. Not measured. The spike measures it.
- **A3** Antialiasing stays on. If the spike shows it costs too much on the phone, it goes off and the edges get reviewed.
- **A4** The standard material with flat shading is cheap enough. If the phone turns out to be fill-rate bound, the Lambert material is the drop-in cheaper option.
- **A5** Dropping the challans' ruled lines, the files in people's hands and the words on the screen doesn't weaken the story. Checked at the M4 and M5 demos (G1).

**Open questions:**

| #   | Question                                       | Blocks                        | Proposed answer                                                                                                                     |
| --- | ---------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Which phone does the spike run on?             | The spike's frame-rate target | Your own Android, named in the spike report. The brief says mid-range                                                               |
| Q2  | Is drei needed at all?                         | Nothing                       | No, until a helper earns its place. Decided at the spike                                                                            |
| Q3  | Does the dashboard read as one without labels? | Nothing until the M4 demo     | Yes: a grid, five bars and a card are a known shape. If not, the still gets small HTML captions beside it, never text in the canvas |
