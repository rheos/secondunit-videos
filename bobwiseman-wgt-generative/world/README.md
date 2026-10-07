# We Got Time world (2026-10-06)

The goal (Robin): build the world and the stills that a full animation will be made from. This
folder holds the world bible and a **living animatic** that shows where everything sits in the song.

- `characters/`: REGULATION DRESS plates 5 (him: front, 3/4, side, back) and 6 (her, plus five
  expressions). Both match typist contender 1 (`../gpt/typist-contender-1/`).
- `keyframes/chNN_*.png`: one or two stills per chapter of `../../bobwiseman-we-got-time/STORYBOARD.md`,
  most repainted from pinball-cut frames in `src/` (layout) with the locked style references.
  `ch05_clouds_on_strike_typo.png` is the first version with a misspelt placard, kept for the record.
- `manifest.json` + `animatic.py`: the old pinball cut (v12) plays under everything; each entry covers
  it for its span (by default the pinball shot containing `at`; `cuts.json` holds those cut points).
  Add a still to the manifest when it's painted, bump `version`, run `python3 animatic.py`. Coded
  shots (`../hybrid-proof`, `../desk-shot`) go in as clips.

World rules so far: faceless crowd, painted leads; more ducting and brass pneumatic message tubes
indoors; the ministry stays grey-teal with her rose collar as the only warm colour until chapter 9,
where colour arrives; the sky chapters (5, 10) are blue.

## Two worlds (Robin, 2026-10-07)

- **Reality:** the multi-level ministry office (`locations/room2_typing_pool.png`), cinematic style. He and she are
  clerks there; the boss, the time clock and the tube mail are real. Its people have bodies.
- **His waking nightmare:** the endless waiting hall of bodiless chair-heads facing the NOW SERVING board. The
  bodiless clerks are intentional (people turned into chairs by waiting). Daydreams (the roof tearing open, the
  walls folding, the clouds' convention) happen inside it.
- What crosses between them carries the story: the paper plane from his hall lands on her real desk. The escape runs
  out of the real building; the sky road belongs to them.

| Song | World |
|---|---|
| 0:00-0:13 | reality: tower, revolving door |
| 0:13-0:58 | nightmare hall ("put me on hold"), roof daydream |
| 0:58-1:50 | reality: ON HOLD snaps him back; her desk, the flower by tube, the levers |
| 1:50-2:50 | nightmare into daydream: WE GOT TIME, walls fold, clouds' convention |
| 2:50-3:01 | reality: complaints torn across the office |
| 3:01-3:23 | nightmare: the machine montage |
| 3:23-4:05 | reality, with the boss as the nightmare horn |
| 4:05-4:50 | reality: he runs back for her, dressed in colour, out the real front doors |
| 4:50-5:41 | theirs: the sky road; then the empty nightmare hall, his chair the only empty one |

`*_nightmarehall.png` files are the earlier versions of reality beats that were set in the hall.
