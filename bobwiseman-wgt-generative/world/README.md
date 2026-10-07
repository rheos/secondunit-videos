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
