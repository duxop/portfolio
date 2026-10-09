---
id: 0011
title: One scroll trigger, one frame loop, keyframes per instance
status: accepted
date: 2026-10-09
needed-by: Stage 5
reversibility: costly
decided-by: shivam
---

## Context

`UI_DESIGN.md` §5 scrubs each hero scene by scroll progress over one pinned screen, and §3.5 makes the hero the only JavaScript pin. The cast is about 130 instances in the crusher scene and 80 in the clinic scene (`3D_DESIGN.md` §4.1, §5.1), most of them in instanced meshes, which have no per-object properties to animate, only a matrix per instance. `CLAUDE.md`'s audit list forbids allocating inside the frame loop and setting React state per frame. Three ways to drive the motion were weighed.

## Options

### Option 1: One ScrollTrigger reports progress; one frame loop interpolates keyframes

A single ScrollTrigger pins the hero and writes `progress` (0 to 1) into a ref. Each scene has one `useFrame` that, for every instance, finds its pose by interpolating between a short list of keyframes held as data, with smoothstep and a per-instance stagger, then writes the instance matrix.

- **Pros:** one trigger and one loop. Nothing is allocated per frame. Scrub and reverse come free from the progress value. It's native to instancing: the matrix is written in the same pass. The keyframes are plain data, so the interpolation is a pure function with a unit test. No Blender.
- **Cons:** easing is uniform unless a per-key easing is added later. No visual timeline editor; positions are tuned by editing numbers and reloading.
- **Cost to reverse:** costly. The keyframe format and the loop are the core of both scenes.

### Option 2: A GSAP timeline with a tween per object, scrubbed by ScrollTrigger

Every moving thing gets tweens on a timeline, and ScrollTrigger scrubs the timeline.

- **Pros:** GSAP's easing library and timeline tools; familiar from M3's motion work.
- **Cons:** instanced meshes have nothing to tween, so each instance needs a proxy object, about 130 of them, and a matrix write per instance per frame on top. Two systems own the motion, GSAP and the frame loop, and they must agree on when a frame is drawn.
- **Cost to reverse:** costly.

### Option 3: Animation authored in Blender, played from the glTF

The clips are baked in Blender and an animation mixer is set to `progress × duration`.

- **Pros:** what you see in Blender is what plays.
- **Cons:** needs Blender and the glTF pipeline, which ADR 0010 rules out. Baked clips and instancing don't mix.
- **Cost to reverse:** costly.

## Recommendation

Option 1. GSAP keeps the jobs it's best at here: the pin and the progress value. Option 2 is better at expressive easing, and that is the trade-off accepted: if a storyboard change needs it, a per-key easing function is a small addition to the keyframe format.

## Decision

Option 1, as recommended (2026-10-09).

## Consequences

- `lib/keyframes.ts` is a pure function, unit-tested at the band edges and in the middle of a band.
- A scene file is data plus one loop. Tuning a scene means editing numbers in its data file.
- The ScrollTrigger and Lenis integration is decided at M3 and reused by the hero.
- The still (`3D_DESIGN.md` §2.8) is rendered by setting progress to 1. No separate "final state" is maintained.
- The spike (stage 5) proves the loop at 40 instances before M4 scales it to 134.

## Revisit when

A storyboard change needs per-object easing curves or sequencing that keyframes with stagger can't express, or the spike shows the loop itself, not the rendering, below the frame-rate target.
