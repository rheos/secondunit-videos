# Generate-then-trace test

Issue #339, 2026-10-28. Does a video model's motion, traced and redrawn by our renderer, give a code-drawn
character weighted, organic movement (the "characters, not marionettes" problem)? The technique comes from the
seeconvm X article on Opus 5.5 motion design ("one-prompt" videos rendered with Seedance, then redrawn in code) and
John Heibel's PDoom pipeline. The video only supplies motion. Viewers never see it.

One test, one look: the paper-depth musician (`../indieagent-paper-depth`, approved 2026-10-24) on its dusk road,
4.5 s, hand-keyed vs traced.

```bash
# 1. pose per frame from the base clip (MediaPipe PoseLandmarker heavy, local, about 20 s)
uv run --python 3.11 --with mediapipe --with opencv-python-headless python tools/pose.py _in/base_seedance25_s1742027786.mp4 assets/pose_raw.json --overlay out/check/overlay.mp4
# 2. clean it and retarget to rig units (writes assets/track.json and assets/track.js)
uv run --python 3.11 --with numpy python tools/track.py assets/pose_raw.json assets/track.json
# 3. render each version (about 30 s each), then the side by side
node ../tools/motion-lab/render.mjs "index.html?v=traced&offline" 0 4.5 out/draft/trace_traced_d1_f0-f108_24fps.mp4 --width 1280 --height 720
```

`?v=keyed` is the rig's own gait timed to the clip (same distance, eases to a stop at the same time), `?v=traced` the
cleaned track, `?v=raw` the track with no cleanup. Review cut: `out/draft/trace_review_d1_sbs_720p.mp4` (18 s:
keyed | traced, the same at half speed, then raw | the base clip with its skeleton).

## What went in

- **Base clip:** Seedance 2.5 US text-to-video, 5 s, 480p, no audio, seed 1742027786, about $1.03 (Fal request
  01a1815e; logged in `secondunit/CREDITS.md`). Prompt asked for a locked camera, profile walk left to right with a
  guitar case, slowing to a stop. The clip is in `_in/` (never committed). sha256 `39552c45...0545`.
- **Pose:** 120 of 121 frames tracked. Frames 0-11 are dropped (he is entering the frame), so the track is src
  f12-f120, 4.5 s.
- **Rig:** `js/musician.js` is a copy of paper-depth's with one change: `pose()` takes `st.trace` for the hip, lean,
  both feet, the case arm, the head and the case swing. Knees still come from the rig's two-bone IK, so bone lengths
  never stretch and knees never bend backwards. Scarf, pom-pom and sleeves keep their own follow-through, phased off
  the traced root. Still a pure function of t: the track is interpolated per frame.

## What worked

- The traced walk has what the keyed one lacks: uneven steps, a slowdown that happens over real steps instead of
  an ease curve, a small shuffle step to bring the feet together (src f87-f91), and a settle once he stops.
  The keyed gait is one sine-driven cycle slowed by a smoothstep.
- Scale came out right with no tuning: 1.357 rig units per source px from leg length, which puts the traced hip at
  -222 against the rig's authored -212, and the traced walking speed at 220 rig units/s against the rig's 230.
- The retarget is small (track.py is about 150 lines, the rig change about 15) and runs in under a minute on the Mac.

## What broke, and the fix in track.py

| Problem | Numbers | Fix |
|---|---|---|
| Limb flips: MediaPipe swaps left and right legs in profile | 11 swapped frames (src f29-31, f64-71) | Keep each leg nearest where it was a frame ago. f64-71 is still the weakest stretch: the near knee kicks up around 2.5 s |
| Foot sliding on planted feet | raw: 6.7 and 3.1 rig units a frame | Lock each planted run to its median spot, 2-frame blend in and out: 0 |
| Occlusion: the case covers his knees, and when he stands the tracker invents a lifted, bent leg behind it (src f98-f116, 30-70 px off the ground) | | Once the feet are side by side and the root is slow, both feet are down |
| A camera-pan estimate (from "the slower foot") was fooled by the leg swaps into a 200 px pan | | Dropped. The camera really is locked: planted feet move 0-1 px a frame on screen |
| Root jitter | walking speed 220 ± 72 rig units/s; hip height spread 8.3 (the keyed bob is 5) | Savitzky-Golay, 3 passes on the root. Some is real gait, some tracker |
| Case swing | a pendulum driven by the wrist's acceleration blew up (±8 rad); driven by the hip it still tilts too far (±0.3 rad, visible around 1 s) | Grip stiffness and damping. Needs another pass, or keep the rig's own swing |

## Verdict

Worth adding to motion-lab as an optional recipe, not a default: "motion from a generated clip" for a hero move
that must feel weighted (a stop, a stumble, a sit-down, a dance step), where hand-keying would take longer than
$1 and an hour. Not for walk cycles in general: the rig's keyed walk is cleaner, and most of the work here was
undoing tracker errors.

If we use it again:

1. **Prompt for the tracker, not for the look.** Plain clothes, no props near the legs (add the case in code), a
   side or three-quarter view that shows both legs, a locked camera. The case cost the most cleanup.
2. **Keep the IK.** Feeding traced ankles to the rig's two-bone IK, rather than traced knees, removed knee flips
   for free.
3. **Lock feet from contact, not from height.** Planted = still in the world and near the ground, and both feet
   down when standing.
4. Next things to try: a 3D pose model (MediaPipe's world landmarks, or a video pose model) to fix the profile
   flips at the source, and the same track on a character drawn in the call-toon or clean-vector look, where the
   figure has no case to hide behind.

Not yet seen by Robin in motion. These notes come from stills and numbers; his eye on the review cut decides.
