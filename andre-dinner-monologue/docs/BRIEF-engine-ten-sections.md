# Engine: take all ten sections as plug-ins (no change to the picture)

Robin approved the storyboard for the other seven sections ("Build as written", Nov 11 2026). Seven
builders will each build one section at the same time. Your job is the small engine change that lets
them do it **without any two of them ever editing the same file**, and without changing one pixel of
what is already built (f1800 to f3397).

Read first: `docs/STORYBOARD.md`, `docs/BRIEF-sections-1-4-8-10.md` (what the seven builders will be
asked to do: your interface has to make every row of it possible), `tests/paper-world/README.md` and
`NOTES.md`, then the code: `js/story.js`, `js/sections/lib.js`, `s05.js`, `s06.js`, `s07.js`,
`js/skin.js`, `js/skin67.js`, `js/main.js`, `tools/render.mjs`, `tools/onsets.py`, `tools/make67.sh`.
Work in `tests/paper-world/`. Units: cm, y up.

## The contract (names are fixed: the builders' brief already uses them)

1. **Section modules.** `js/sections/s01.js` to `s10.js` all exist and `js/story.js` imports all ten.
   s05 to s07 are the built ones. The other seven start as stubs you write: `F0`, `F1` (0-196,
   196-504, 504-1196, 1196-1800, 3397-3840, 3840-4315, 4315-4761), empty `C` and `BEATS`, and a
   camera that glides from its first join to its last. `story.js` joins them generically. Optional
   hooks a section may export, applied in section order for every f (a section's hook must return
   "no change" outside the frames it cares about):
   - `flame(f, fl)`: change the flame's state (gain, height, lean, lit or out, the card hinged down);
   - `fill(f)`: a factor on the room fill and the cloth's bounce;
   - `grade(f)`: `{ expo, tint: [r, g, b], sat }` for the final pass (1, [1, 1, 1], 1 = as now).
   The film range becomes f0 to f4761. `sectionAt`, `camAt`, `BEATS`, the blocking export and the
   browser loop follow from the list.
2. **Skin modules.** `js/skins/s01.js` to `s10.js`, each `export async function build(X)` returning
   `{ update(f, jitter, cam) }`. `buildSkin` builds them in section order and calls every `update` in
   section order on every frame. The seven new ones start as stubs. Sections 5 to 7 keep `skin.js` and
   `skin67.js` (wrap them; do not move their code unless you must). `X` is the shared kit, documented:
   the scene, the plate loader (trimmed to alpha), the card and standee makers, the candle tint, the
   shadow set-up, the cloth-slot drawer, the pre-blur helper, the layout (`LAY`), and the registry.
3. **The registry.** Every piece any skin makes is registered by name: `X.reg.get(name)` gives
   `{ obj, section, kind, set }`. The rule that makes sharing safe: **an owner sets every animated
   property of its pieces from scratch on every frame** (position, rotation, scale, visibility,
   opacity, uniforms). So a later section's `update` may re-pose an earlier section's piece, and the
   change lasts exactly that frame. Check that `skin.js` and `skin67.js` obey this and fix where they
   do not. Give the registry small named setters where a raw property is not enough, and prove each
   with a throwaway check (not left in the code): hide the open hand and slide it out; fold a plate
   tower, a glass tower and the bottle flat about their bases; take a tower's windows from lit back to
   dark (0 to 1); telescope a plate tower back into its plate; lay the pine and the redwood down;
   hinge the fence cutlery back down; hide a citizen or guard so another card can stand in its place;
   hinge the near plate disc up like a lid; fade any piece and any drawn slot to nothing. Print the
   list of names: `NAMES=1 node tools/render.mjs`.
4. **Joins.** `js/sections/joins.js` holds the camera at each boundary between two unbuilt sections:
   position, target and velocity per frame. `lib.js` gets `joinKey(f)` returning a camera key with its
   tangents. A section's first camera key is the join at its F0 and its last is the join at its F1.
   Where the neighbour is built, the join is read from it: f1800 is section 5's first key with its
   velocity, f3397 is `handover(S7.CAM_KEYS, 3397)`. Values (P, T, mP, mT):

   | f | P | T | mP | mT |
   |---|---|---|---|---|
   | 0 | [-2, 16, 96] | [8, 9, -10] | [0.01, -0.03, -0.12] | [0, 0, 0] |
   | 196 | [-5, 9, 70] | [1, 3.5, 44] | [0.01, -0.005, -0.05] | [0.004, 0, -0.01] |
   | 504 | [-8, 11, 60] | [-3, 4, 30] | [-0.03, 0.03, -0.12] | [-0.05, 0, -0.3] |
   | 1196 | [-17, 5, -39] | [-30, 2.2, -50] | [0.02, 0.01, 0.04] | [0.02, 0, 0.05] |
   | 3840 | [-58, 18, 16] | [-170, 10, 4] | [-0.04, 0.01, 0] | [0, 0, 0] |
   | 4315 | [-12, 4, 36] | [2, 3, 10] | [-0.01, 0.01, 0.05] | [0, 0, 0] |

5. **Cues.** One word list per section, owned by its builder: `tools/cues/sNN.json` (key, word,
   Whisper frame, optional hand pick, and a `stills` list of frames). `$PY tools/onsets.py NN` snaps
   that list with the same method as now and writes `js/cues/sNN.js`. Sections 5 to 7 keep
   `js/cues.js` exactly as it is. Generated cue files hold transcript words: they stay out of git.
6. **Before f1800 and after f3397.** `window.renderFrame(f)` works for 0 <= f < 4761. Before f1800
   the table is as set: section 5's state before its first event (plate discs flat, cutlery lying
   flat, glasses and bottle with dark windows, basket, shakers, the sapling in its pot, the candle
   burning, the tree man and the citizens out of sight). After f3397 everything holds section 7's
   last state. Check stills at f100, f800, f1500, f3600, f4500 and fix whatever does not hold (a
   flicker keyed to f, a parity count, a cue read before its time).
7. **Tools.** `zsh tools/make-section.sh NN [f0 f1]`: renders that section (or a range inside it) to
   `out/paper-world/frames-sNN/`, muxes the voice from `_in/andre.wav` cut to the range, and for the
   whole section writes `out/paper-world/andre_paper-world-sNN-test01_f<F0>-f<F1>_24fps_720x1280.mp4`
   (a part range goes to `out/paper-world/wip/`), the stills named in the cue list and a contact sheet
   to `out/paper-world/check-sNN/`, the camera-speed list, the luma list, badframes and flashcheck.
   A whole-section render takes a machine-wide lock, so only one runs on this Mac at a time and the
   others wait their turn; single stills (`FRAMES=... node tools/render.mjs`) never wait. Make sure
   several `render.mjs` runs at once do not collide (ports, profile folders, output names). Everything
   heavy runs under `nice -n 15`.
8. **README.** A section "How to build a section": the files a builder owns, what is in `X`, the
   registry and its setters with the names, the hooks, the joins, the cue list, `make-section.sh`,
   and the rule about clearing pieces.

## Proof

- Section 5 to 7 unchanged: render f1800, f2215, f2400, f2543, f2600, f2800, f3007, f3128, f3250,
  f3396 before you start and when you finish; mean absolute difference under 1 of 255 per channel.
  Put the table and a before-above-after-below sheet in `out/paper-world/check-engine/`.
- The stubs: stills at f100, f800, f1500, f3600, f4500 in the same folder, and one 48-frame wip
  render across f3397 (f3373 to f3421) to show the camera carries over the join.

Do not touch `paint.sh`, `plates.json`, `work/plates/`, `js/cast/`. No git commands. Keep your context
small: read contact sheets, not runs of full-size stills, and pipe long output through `tail`.

Report under 250 words: what changed, the regression numbers, the registry names and setters, anything
in sections 5 to 7 that did not reset every frame, and anything the seven builders must know that is
not in the README.
