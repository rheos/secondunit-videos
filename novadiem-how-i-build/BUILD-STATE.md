# How I build: build state

Music-only blueprint explainer for the video slot on Robin's Upwork profile (slate item 4 in
`~/Code/novadiem/assistant/explainer-slate.md`). It reads as "how this developer works": the delivery
flow as one line that draws itself, then three finished explainers as evidence.

## Facts used

- The flow, issue → branch → draft PR → checks/review → merge, merge commit and never squash: the
  "GitHub delivery flow" section of `~/.claude/CLAUDE.md` ("Create the issue first (restate the ask as
  reproduction steps or acceptance criteria)", "reference it from the PR (`Closes #N`)", "keep commits
  on the branch", "Never squash-merge... Every commit stays on GitHub").
- Deploy, then check the live result: the slate's beat list for this film, and Robin's standing rule to
  verify a deploy after merging (assistant memory `feedback-merge-prod-prs`).
- Independent review only where a bug would stay silent; reviewers work in a fresh context; the
  silent categories (durable state, money, auth, migrations, outbound sends):
  `~/Code/novadiem/assistant/ideas/cold-read-video.md` (look bible, beat sheet, "Facts to keep straight").
- No numbers drawn by this film. The only figures on screen are inside the 300 of 300 clip (300 / 300,
  180 / 180), which are that film's own results.
- Evidence titles and lines come from each film: rheoStream "One system. You own it." and "an open
  framework"; The Cold Read "when is independent review worth its cost?"; 300 of 300 Fields "a
  document extraction API, checked".

Nothing is drawn dashed as planned: every step shown is in use. The dashed line in plate II is the
PR's "closes" link and the colophon's boxes are construction lines.

## Score

- score-library `drafting-table-how-i-build/take-01` (rheos/indieagent-workspace, branch
  `score/how-i-build`), sha256 `bf9292eb151e752925276269b0600068c7ad318793ad53a288c181d2cf72cc89`,
  86.0 s, ~95.7 BPM, -11.0 LUFS (the root plays it at volume 0.75). Music resolves ~80.8 s; the film
  ends at 84.
- `beats.json`: librosa beats 2.55-80.06, extended to 0.05 and 85.70 at 0.627 s.
- Fresh checkout: `cp ../score-library/drafting-table-how-i-build/take-01.mp3 novadiem-how-i-build/_in/score.mp3`
  (from `secondunit/mv-projects`) and check the hash.

## Clips (`_in/`, gitignored; muted, 1280x720 at 24 fps)

| File | Source | In | Length | Red phrase |
|---|---|---|---|---|
| `clip-rheostream.mp4` | `_wt-rheostream/novadiem-rheostream/renders/rheostream-draft1.mp4` | 31.8 | 7.5 | "You own it." |
| `clip-cold-read.mp4` | `mv-projects/novadiem-cold-read/renders/cold-read-artpop_take02_f0-f2208_24fps_draft2.mp4` | 46.2 | 7.5 | "No shared conversation." |
| `clip-doc-extraction.mp4` | `_wt-doc-extraction/novadiem-doc-extraction/renders/doc-extraction_take01_f0-f2112_24fps_draft1.mp4` | 71.6 | 8.0 | "180 of 180" |

Recreate with `ffmpeg -ss <in> -i <source> -t <length> -an -vf scale=1280:720,fps=24 -c:v libx264 -crf 16 -pix_fmt yuv420p`.

## Layout

Theme `paper`. `window.HB.flow(parent, keys)` on the root draws the delivery flow at stage coords;
each plate builds the state it inherits, fully drawn, and draws its own new parts. Main runs along
y 600, the branch lane along y 420 (fork at x 540, merge at x 1300), the issue card at 130-430, the
draft PR frame 600-1200, the review chamber 900-1340 above the checks gate, the deploy at 1590-1770
with the live screen above it. Bar stations are the flow itself: ISSUE 0, BRANCH 8.8, DRAFT PR 12.56,
CHECKS 20.06, MERGE 32.55, DEPLOY 40.05.

## Plates (score seconds)

- **I · The Issue (0-8.05).** Main draws 1.3; issue card 1.93; header, ACCEPTANCE CRITERIA, three
  checkbox rows 3.81/4.44/5.06. "Every change starts" 3.81, "as an issue." (red) 4.44.
- **II · The Branch (8-19.05).** Branch leaves main 8.8; four commits one beat apart from 10.05.
  "Then a branch," 9.43. Draft PR frame 12.56, "and a draft PR." (red) 13.19. Dashed CLOSES link
  back to the issue 14.42.
- **III · The Checks (19-31.05).** Gate and three check boxes 20.06, ticks 20.69/21.29/21.92. "Every
  PR is checked." 21.29. Leader up to a double-walled INDEPENDENT REVIEW chamber (FRESH CONTEXT) 23.17-24.4;
  WHEN A DIFF TOUCHES / DURABLE STATE · MONEY / AUTH · OUTBOUND SENDS 25.05-25.68. "Independent
  review where bugs stay silent." (red) 25.68.
- **IV · The Merge (31-39.05).** Chamber clears 31.93. Branch curves into a merge commit on main
  32.55-33.18; PR relabels to PR · MERGED 33.81. "A merge commit." 33.81, bracket EVERY COMMIT KEPT
  and "Never a squash." (red) 34.44.
- **V · The Deploy (39-47.05).** Main carries the change to DEPLOY 40.05-41.31. "Deployed," 41.31.
  Live screen 41.94-42.56, tick and "then checked live." (red) 43.19. Flow clears 46.3.
- **VI · The Evidence (47-75.1).** The drawing is three sheets wide and pans inside the border. The
  line runs on from the deploy and stops at each film: frame 1120x630, muted clip, caption
  (EVIDENCE · I-III, title, two lines). Clips at 49.44 / 57.56 / 65.69; pans 55.68 and 63.81; the line
  runs off the right edge just before each pan. No red phrase of its own: the clips carry theirs.
- **VII · Colophon (75-84).** The flow as construction boxes, then "Every change has a record." 76.3,
  "An independent check where it matters." 76.93, "And a deploy you can see." (red) 77.55,
  novadiem.com 78.81. Holds to the end.

## Gotchas met here

- Two `fromTo` tweens on the same property: the later one renders its from-value at build time and
  wins at time 0 (plate VI's second pan parked the view on stop 2). The later tween takes
  `immediateRender: false`.
- `hyperframes check` warns `nested_media_start_basis_ambiguous` on the three videos. Their
  `data-start` values are plate-local on purpose.

## Draft 1 (2026-10-17)

https://youtu.be/DCNt9uMnOHQ (unlisted, default channel), 84 s at 720p
(`renders/how-i-build_take01_draft1.mp4`, remuxed from `-raw`). flashcheck PASS (worst 0.5 flashes/s at
49.5 s, the first clip fading in). -13.5 LUFS integrated, true peak -2.8 dBFS. Grep audit of the
sources: no names, amounts, vendors or keys.

## Upwork's rules for this slot (checked 2026-10-17)

The profile "Video introduction" takes a YouTube link with monetization off; the Help Center sets no
length and no on-camera rule. Upwork's blog advises talking to camera and 30-60 s. The separate
Boosted Profile video (paid, gated) requires up to 60 s, "really you", and no background music, so a
music-only film can't go there.
