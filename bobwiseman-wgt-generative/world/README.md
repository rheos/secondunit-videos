# We Got Time world (2026-10-06)

The goal (Robin): build the world and the stills that a full animation will be made from. This
folder holds the world bible and a **living animatic** that shows where everything sits in the song.

- `characters/`: plates 7 and 8 (AMENDED) are him and her in colour, for chapter 9 on. REGULATION DRESS plates 5 (him: front, 3/4, side, back) and 6 (her, plus five
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

**Storyboard change (Robin, 2026-10-07), the Graduate escape:** he no longer meets her on the road. On
"But I don't care what it costs" he runs back for her; her laughter dresses them both; they run out of the
ministry hand in hand while the clerks rise like wedding guests; they walk the hundred miles together.
Those beats are in `keyframes/escape/` (`ch09_both_dressed_dupe.png` is the version with a duplicated her).

**New style (2026-10-07):** the cinematic painted look from the other session (`../gpt/sky-cabs`, `../mj/14-15`).
`style2/` holds the restyled plates 5-8, the guitar-case prop sheet (ISSUE ITEM 27B) and the style references.
`upgrade_one.sh` repaints a still into `keyframes_v2/` (style ref by setting: ministry interiors, city
exteriors, sky); `new_beat.sh` paints a new beat straight in the new style (`keyframes_v2/beats.tsv`).
With `use_upgrades` in the manifest, `animatic.py` uses a still's `keyframes_v2` version when one exists, and
entries listed later win where they overlap. World logic: waiting is his job (he's an employee of the
Ministry of Waiting; 7 436 912 is his employee number); pneumatic tubes are realistic, hand-width; the flower
goes by mail (his row's mail column, ceiling tubes, her desk bell). Files ending `_widetube`, `_lumpycase`,
`_allcases` are the rejected versions, kept for comparison.
