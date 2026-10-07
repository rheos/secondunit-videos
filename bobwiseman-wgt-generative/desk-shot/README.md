# Desk shot: her desk and the ticket (2026-10-06)

Song 59.667-64.917 s (frames 1432-1558), after ch03 of the pinball cut, no AI video. GPT Image painted
the stills; `desk.html` animates them.

- `assets/desk_plate.png`: her desk with her removed, a brass delivery tube and bell added, more tubing
  (edit of `../gpt/typist-contender-1/typist_hero.png`).
- `assets/her_a.png` (writing) and `assets/her_b.png` (reaching): pose A is registered to the plate;
  pose B came back as its own crop facing away, so the page mirrors it and fits it to pose A's bounds.
- `assets/plane.png`; `assets/insert_a.png` / `insert_b.png`: the insert repainted from pinball frames
  1512 and 1536 (`src/`), ticket text exact.
- Motion: slow push-in; the plane comes in over the lamp, lands at 61.85 s and skids; she swaps to pose
  B on the landing; at 62.667 the insert, and the ticket opens at 63.25 with a paper flash.

Known flaws: on the swap she shifts slightly right and the form she was writing on disappears.
Render: `PAGE_DIR=<this dir> PAGE=desk node render_page.mjs video 59.6666667 64.9166667 out/<name>.mp4`
(fix the playwright import and audio paths at the top).
