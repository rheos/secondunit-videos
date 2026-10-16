# Experiment log

One entry per take, newest at the bottom. Each take records:

- what changed and why
- the settings that matter (BPM, SEED, PREVIEW, OUTLINES, section beats)
- the commit
- where the renders are
- the verdict

Commit the script before rendering, so every MP4 in `out/` maps to an exact version of the code.
Name renders after the take (`tools/render_preview.py -- take-02`).

To try a variation, change the script, add a take entry and commit. Don't copy the folder:
git history keeps every version. Tag a take worth returning to: `git tag orb-take-02`.

---

## Take 01 (2026-10-16)

**Brief.** A clean, slightly flat, illustrative 15-30 s visualizer. A small glowing orb travels
through varied scenes: abstract orbits, soft geometric environments, atmospheric transitions. It
needs smooth camera moves, a cohesive palette, and should feel music-video rather than technical.

**Settings.** Blender 4.5.14 LTS, EEVEE Next.
- 24 fps, 120 BPM, 48 beats (576 frames, 24 s).
- SEED 7, OUTLINES on.
- Sections start at beats 0 / 12 / 24 / 36. Drops at 12, 24, 36.

**Palette.**

| Role | Hex |
|---|---|
| Ink | #17122B |
| Shadow | #2A1F4A |
| Plum | #4A2F63 |
| Coral | #F2786D |
| Peach | #FFB38A |
| Cream | #FFF1DC |
| Gold | #FFD27A |
| Teal | #3BB7B0 |
| Lilac | #9C8BD8 |

| Section | Sky / fog |
|---|---|
| Orbits | #3A2F6B |
| Corridor | #E39A8E |
| Pillars | #16505E |
| Finale | #1C1535 |

**v1 → v2 fixes, after the first stills:**
- Frame 430 was black. The fog swell (mist depth 4 m) swallowed the orb, so the depth is now 9 m.
- The pillar crane shot lost the field off the bottom of the frame. The camera now ends nearly
  overhead at (-1, 110, 16), and the f-stop goes to 8 over the field so the ripple reads.
- The orb's light pool on the floor came out grey. The floor's light ramp color is now
  plum mixed with peach.
- The finale backdrop disc looked muddy through the fog. It's now coral and closer.
- Distant drifters crowded the top of the first shot. Now 6 of them, 12-20 m out, lower.

**Renders.**
- Stills and the full 720p preview (`take-01_preview_720p.mp4`, 7.6 MB) are in `out/` on the Mac.
  A copy is in ~/Downloads.
- Contact sheet: `reviews/take-01_v2_contact.jpg`. Every 18th frame: `reviews/take-01_v2_motion-strip.jpg`.

**Render cost.** About 1.4 s per frame at 960x540 / 16 samples, and about 15 min for the full
576 frames at 720p.

**Verdict.** It works as a first pass. Motion reads cleanly through all four sections.
- Strongest: the corridor and the finale burst.
- Weakest: the beats 24-26 bridge, which is mostly teal fog with the orb in it, and the corridor
  fog at beat 12, which is a flat peach screen for half a beat.
- Robin has not reviewed it yet.

**Ideas for the next takes.**
- Bake a real song into `energy` and set the sections to its structure.
- Add a second `highs` energy channel for satellite spin and shard sparkle.
- A 9:16 cut: 1080x1920, a wider lens, `shift_x` 0.
- Lyric-safe framing: key `shift_y` to hold a third empty per line.
- Replace the 81 pillar objects with a Geometry Nodes grid, so a bigger field stays cheap.

---

## Take 01b: the same piece on Blender 5.2 (2026-10-16)

**Why.** This Mac is an Intel MacBook Pro and can't run Blender 5. The newer agent skills target 5.x,
so the lab needs a way to render on 5. See `notes/skill-survey-2026-10-16.md`.

**Changes to the script (no visual change on 4.5).**
- The compositor is built two ways: on 5.x a node group with a Group Output, on 4.5 the scene tree
  with a Composite node.
- Both mixes now use the generic Mix node in Color mode.
- Glare's type is set through the property or the 5.x menu socket.
- Video output sets `media_type` first on 5.x.
- The reset also removes the `OV_` compositor node group.

**Checks.**
- On 4.5, frames 60 and 200 are bit-identical to take 01. Frame 445 is 54 dB PSNR (sampling noise in
  the burst).
- 5.2 on Modal CPU (software GL) against 4.5 locally gives 50, 60 and 43 dB on frames 60, 200 and
  445. That is the same picture; 5.2's bloom is a little tighter.
- Sheet: `reviews/port-4.5-vs-5.2_stills.jpg` (left 4.5, right 5.2).

**Cost so far.** Two CPU runs (probe, three stills). Under 2 minutes of an 8-core container each,
a few cents.

**Open.**
- The GPU stills test is blocked until a card is on the Modal account.
- It will show whether EEVEE sees the NVIDIA GPU through EGL or falls back to llvmpipe there too
  (the run prints `gpu_renderer`).

