# Hybrid proof: painted stills, code motion (2026-10-06)

5 s of the ch02 hall (song 33.0-38.0 s, frames 792-912) with no AI video. GPT Image painted the
still parts once; `proof.html` does all the motion on a canvas.

- `assets/plate_raw.png`: the hall with Robin's extra ducting and brass pneumatic tubes, guitar case
  and capsules removed (edit of `../gpt/typist-contender-1/env_hall_ducts_tubes.png`).
- `assets/him_walk_a.png`, `assets/him_walk_b.png`: him from behind, two steps, transparent, painted
  to match the typist (contender 1). `assets/old/` holds the first, too-realistic pair (not committed).
- `assets/capsule.png`: brass message capsule, transparent.
- Motion: slow push toward the vanishing point; he walks in from below frame on a perspective line
  (height = 0.92 x (feet y - horizon)), steps every 0.3 s, with a contact shadow and a faint floor
  reflection; five capsules shoot through the glass tube runs, clipped to the glass.

**Character rule (Robin, 2026-10-06):** the crowd stays faceless (blank heads, painted to match the
hall); only he and she have faces, in contender 1's flat gouache.

Render: `node render_proof.mjs video 33 38 out/<name>.mp4` (edit the playwright import path and the
audio path at the top; needs `--allow-file-access-from-files` because the page reads cut-out alpha).
Known flaw: the rising capsule passes over the brass bands on the glass column instead of behind.
