---
id: 0010
title: Hero scenes from three.js primitives, no Blender
status: accepted
date: 2026-10-09
needed-by: M4
reversibility: easy
decided-by: shivam
---

## Context

`UI_DESIGN.md` §5 (approved 2026-10-08) fixes the cast of both hero scenes: rocks, cells, challans, a crusher, a belt and dashboard blocks; papers, people, chairs, a desk and a wall screen. Every one of them maps to a three.js primitive (`3D_DESIGN.md` §4.1 and §5.1). Brief §6 listed Blender and free low-poly packs, but for the project scenes, which were dropped on 2026-10-08 when the case studies moved to still images; brief §7's M4 already called for the hero "from primitives only". Blender is not installed on the development machine (checked 2026-10-08), and nobody on the project has used it.

## Options

### Option 1: Primitives only

Every shape is a three.js geometry built from numbers: icosahedron, box, plane, cone, cylinder. Blender stays the upgrade path for one prop at a time.

- **Pros:** no Blender to learn, no glTF export and compression pipeline, no model bytes against the 1.5 MB budget, no loader in the chunk. Shapes match the tokens and the flat-shaded look by construction. The only thing to learn is three.js itself, which M4 needs anyway.
- **Cons:** simple silhouettes. The crusher is a truncated pyramid on a box; a person is a sphere on a cone.
- **Cost to reverse:** easy. A glTF prop replaces one group; the rest of the scene is untouched.

### Option 2: Primitives for the cast, Blender for the two hero props

The crusher and the reception desk are modelled in Blender and exported as `.glb`; everything else stays primitive.

- **Pros:** better silhouettes on the two objects the eye rests on.
- **Cons:** learning Blender, which the brief's course doesn't budget for; a pipeline of export, `gltf-transform` compression and a loader; model bytes; and two visual languages to keep matched.
- **Cost to reverse:** easy.

### Option 3: Free low-poly packs

Props adapted from Kenney or Poly Pizza.

- **Pros:** the fastest route to a finished-looking prop.
- **Cons:** their style and colours won't match the tokens without rework in Blender, so Option 2's costs come anyway; licences to track; and the pipeline from Option 2.
- **Cost to reverse:** easy.

## Recommendation

Option 1. The storyboard was written for primitives, the brief's M4 asked for them, and nothing in either scene needs a modelled shape. Option 2 is better at silhouettes, and that is the trade-off accepted: if a prop fails review for its shape, that one prop goes to Blender.

## Decision

Option 1, as recommended (2026-10-09).

## Consequences

- No `.glb` files, no `public/models/`, no compression step, no loader in the 3D chunk. The 1.5 MB model budget in PRD NFR-1 stays as a ceiling nothing uses.
- Brief §6's "Models" row, brief §7's M5, and `CLAUDE.md`'s models line are updated. M5 becomes the clinic hero scene.
- The learning scope for stage 5 and M4 is three.js, React Three Fiber and GSAP, nothing else.
- The still for each theme is a render of the primitive scene (`3D_DESIGN.md` §2.8), so it has the same simple silhouettes.

## Revisit when

A prop is rejected at the M4 or M5 demo for its shape after the primitive version has been tuned in the lab page.
