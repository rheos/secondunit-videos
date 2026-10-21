# Respawn (Bob Wiseman, Real Thing): where things are

Start here in a new session. Last updated 2026-10-20, after draft 1's review cut was rendered.

## Status

- **Draft 1 is rendered and with Robin, not watched yet.** Whole song, 165.9 s, 1280x720, 24 fps:
  `out/film/respawn/join/realthing_respawn-d1_f00000-f03980_24fps_draft.mp4` (also copied to `~/Downloads`).
  Not uploaded, not on Bob's review page. Robin watches every Bob draft first; upload and the round need his typed go in
  the session doing it.
- Bob has said nothing about Respawn. It is round 41 option C on his page (the 28 s sketch, YouTube 6cc6nqp0Zz8). His
  one note and pick on that round were on The pet. The gorilla film (draft 3, round 40) and its style tests (PR #266)
  run in parallel; Respawn develops alongside, not instead.
- Spend: about $6.35 on Modal CPU for the whole song at 720p (Robin's cap for this draft was $10). A 1080p pass is a
  re-render at 1920x1080, about 2.25x that; house rule is 720p drafts, 1080p master after sign-off.

## Where

- Repo: rheos/secondunit-videos, branch `realthing-respawn` (off `realthing-pixel-tests`), draft PR #270 (stacked on
  #246), issue #269. Worktree: `secondunit/_wt-rt-respawn/`; this lab is `blender-orb-visualizer/` in it.
- Storyboard (gitignored, names the song's line times): `STORYBOARD-respawn.md` here. Plan 2: lyric symbols as rhymes,
  never pictures; the matrix shape in game terms (the loop, the guard who is every guard, the "Continue?" prompt, the
  construct, the crack as the exit); a face library with an eye highlight for the two who wake. No little Bob.
- Song, section map and lyric onsets: `mv-projects/bobwiseman-real-thing/` (README.md, assets/song.wav, and the
  gitignored STORYBOARD-gorilla.md for the per-line onset table).
- Lab log: `EXPERIMENTS.md` (take 07 = the sketch; the plan, stills and acts entries at the end).
- Memory: `bob-real-thing.md` in the IndieAgent memory store; hand-over note in the side-session notes folder.

## The code

| File | What |
|---|---|
| `respawn_world.py` | the shared world: `W = build(F0, F1, OUT)`; village (one tile, x -34..50, y -40..40), pond + fisher + fish, stall, Mayor's balcony, edge sign, void grid, crack wall, sunrise shore, the cast (keeper, seller, heroes via `W.make_hero`, guard + 4 board doubles, fisher, Mayor), face library (`scripted polite flat doubt fear grief wonder tender laugh` + `hl`), `W.village_loops`, `W.seller_wave`, `W.light(f, noon|night|edge|void, crack)`, `W.shot`, `W.crack_open`, `W.refl` (the sharp reflection head) |
| `film_kit.py` | shots, keys, `pixel_groups(base_keys, [(names, size_keys)])`: one pixel size per object group, matte pixelated with the fill |
| `respawn_act0.py` .. `respawn_act7.py` | one act each (frames: 0-503, 504-1183, 1183-1654, 1654-1956, 1956-2539, 2539-3130, 3130-3396, 3396-3980); act 1 is the template; neighbours share the boundary frame and the later act wins it |
| `respawn_stills.py` | the four look stills (pond, line, tile, cross) that Robin approved before the build |
| `realthing_respawn.py` | take 07, the 28 s sketch the film grew from (its s1-s2b are act 1's first 11 s, protected) |
| `cloud/modal_respawn.py` | `modal run cloud/modal_respawn.py --act N --chunks 8`: Blender 4.5 bpy wheel on Modal CPU, the lab mounted, frames to `out/film/respawn/actN/frames/`. Launch acts one at a time with ~45 s between (five at once hit Modal's app-create rate limit) |
| `tools/respawn_join.py` | joins the acts' frames on the song into the review cut (refuses gaps; fades the last second) |
| `tools/render_lock.sh` | one headless Blender at a time on the Mac; wrap every local stills render in it |

Render rules: stills only on the Mac (`tools/render_lock.sh blender -b --factory-startup --python respawn_actN.py -- --stills a,b,c`,
about 13 s a frame), never `--render` locally (long EEVEE renders crash this Mac). Whole acts go to Modal.

## Known rough spots for draft 2 (from the builders' reports)

- Act 4: three straight cut-jumps (stall front to her stand at 2104, stand to the road at 2163, road to the edge at 2416).
- Act 6: the flower hand-off (3203-3214) is cramped, hands at lap height, his face in profile; a face-on camera at the open
  crack blows out (spill), so the pull is from behind.
- Act 7: the flower in his left hand hides between their bodies in the behind shots; the hero's head turn at the end reads
  subtly from behind.
- Act 5: the prompt is small in the tile wide; the seated keeper is low-right in the act's last camera.
- Act 3: the reflection goes partly under his torso once he bends to the water; the Mayor's balcony pan starts behind the awning.
- Everywhere: the keeper's apron reads as a white slab from the side.
- Possible world helpers builders asked for: a `night_tile(f, on)` (act 5 builds its own dark sky card), a spill multiplier on
  `W.light` for face-on shots at the crack, a first-key guard on `vis()`.

## Next

1. Robin's notes on draft 1 (studio notes are at studio.novadiem.com/bob/ once a round exists; before that, in chat).
2. Draft 2 fixes per act; re-render only the changed acts on Modal; re-join.
3. On Robin's go: upload unlisted with `secondunit-worker/yt_upload.py`, post as a round on Bob's page beside the gorilla
   (client-review skill, workspace 6), update rheos/secondunit-videos#122 and `bob-real-thing.md`.
4. Mark the PR ready and merge via GitHub (merge commit, never squash) when Robin says.
