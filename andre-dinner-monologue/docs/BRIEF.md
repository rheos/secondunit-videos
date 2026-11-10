# Builder contract for the four look tests

Read `LOOKS.md` first (the brief, the sections, the pick). Then this file, then your look's section below.

## Paths

- Project: `/Users/robin/Code/novadiem/indieagent/secondunit/_wt-andre-dinner/andre-dinner-monologue/`
  (a git worktree of rheos/secondunit-videos on branch `andre-dinner-reel`, checked out from origin/main).
  Sibling reference projects live one level up (`../bobwiseman-in-her-dream/` and so on).
- Your folder: `tests/<slug>/`. Everything you make goes there, except renders and stills, which go in
  `out/<slug>/`. Touch nothing else in the repo. No git commands at all (the conductor commits).
- Audio: `_in/andre.wav`, 48 kHz 16-bit stereo, 198.37 s, sha256 in `_in/andre.wav.sha256`. The master is
  never re-encoded, stretched or edited in place. Never delete or overwrite anything in `_in/`.
- Timing: `_in/cues.json` (24 fps frames, `segments[]` and `words[]` with f0/f1 and t0/t1). Whisper
  timing: words can run 0.3 to 1 s early. Any hit that must land on a spoken syllable is snapped to an
  onset of `_in/andre.wav`: rise in log energy over 40 ms, strongest peak within ±0.6 s of the cue time,
  keep the cue time when the onset is weak. `_in/transcript.txt` is the readable version.
- Never pull, fetch or edit the shared checkout at `~/Code/novadiem/indieagent/secondunit/mv-projects/`
  (other sessions' uncommitted work sits there). You may symlink its `node_modules` only:
  `ln -s /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-in-her-dream/node_modules`
  inside your test folder (Playwright with chromium is installed there). Never symlink data folders.
- Python with numpy: `/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python`.
  ffmpeg and ffprobe are native. ImageMagick is not: tile contact sheets with ffmpeg (`tile=3x4`).
- Shared Mac: run every render and scan with `nice -n 15`. Three other builders run beside you.

## Output

- Frame: 720x1280 (9:16), 24 fps, your section's frames, half-open `[f0, f1)`. Draft quality: H.264,
  crf 23, yuv420p.
- Review file: `out/<slug>/andre_<slug>-test01_f<f0>-f<f1>_24fps_720x1280.mp4` with the audio muxed
  from the master: `ffmpeg -ss <f0/24> -to <f1/24> -i _in/andre.wav` (aac 192k), video from your frames.
  Check with ffprobe that the duration equals (f1-f0)/24 within one frame and that it plays to the end.
- Stills: `out/<slug>/check/` full-size PNG or JPEG of every shot's first frame, every line start, the
  climax frame and the last frame, named `f<frame>.jpg`, plus one contact sheet `sheet.jpg` of those.
- `tests/<slug>/README.md`: the exact commands to render and to make the stills, the SHOTS table (frame
  in, frame out, what is on screen, the words it answers), and the file list.
- `tests/<slug>/NOTES.md`: BANNED list (every default you reached for in the first render and took out),
  known defects with frame numbers, what you would change for the full film.

## The contract every canvas look keeps

- `index.html` renders frame t from a pure function of t: `window.__ready` (a Promise), and
  `window.__frameJPEG(t, q)` returning a data URL, so `../../../tools/motion-lab/render.mjs` (three levels up from `tests/<slug>/`) and
  `audit.mjs` work. `?t=<s>` seeks in the browser, `?w=` sets the width (default 720, height 1280).
- Seeded randomness only (a hash of the element id and frame, or a fixed seed), so frames render out of
  order and in parallel without change.
- Render with `nice -n 15 node ../../../tools/motion-lab/render.mjs index.html <t0> <t1> <out.mp4> --width 720 --height 1280 --audio ../../_in/andre.wav`
  (read `tools/motion-lab/README.md` for the audio-offset flags; if the render tool cannot cut the audio,
  render silent and mux with ffmpeg as above). Read the README of the reference project you build on for
  its own render and still flags; `tools/motion-lab/README.md` for the audit and views tools.
- Scan the finished file with `nice -n 15 $PY ../../../tools/cloud-render/badframes.py <mp4>` and
  `$PY ../../tools/motion-lab/flashcheck.py <mp4>`. Both must pass. Fix what they find.

## Rules that bind every look

1. The audio is the clock. Every event is placed on a frame from the cue data, not by eye.
2. No faces, ever. People are silhouettes in profile, line figures, or absent. No rubber-hose cartoon.
3. Words on screen only in the `type` look, and only words from `_in/cues.json`. Every word fits its
   box with margin, in the longest copy it takes. A line holds at least 1.5 s (36 frames) after its last
   word before it leaves. In the other three looks, no text at all.
4. One focal point per frame, generous negative space, every frame a print. The 9:16 frame is tall:
   compose for it (stack, rise, fall), never a letterboxed 16:9 idea.
5. The catalogue look is a starting point, never a template: keep its rules and surface, change what
   this speech needs, and bring none of the last film's motifs (no gold laugh rings, no orange, no
   plane, no rocket, no musician).
6. Build a language, not a copy: no named painting's composition, no frame of the film recreated.
7. Motion: springs with a damping ratio (0.7 to 0.85 premium; `tools/motion-lab/motion.js`), paper on
   twos where the look says so, arrivals with overshoot, one slow camera move per shot. Nothing pops
   from nowhere without a reason in the words. Measure, don't feel: `views.mjs onion` on the hero move.
8. Before you report: full-size stills at every event frame; describe what each still shows and check
   that against the words it answers (a missed beat is a defect); badframes and flashcheck pass; the
   review file plays full length with the voice in sync (check a late word against the picture by
   extracting the frame at its cue time).
9. No paid tools (no Higgsfield, Midjourney, fal, ElevenLabs). Free code only.
10. Finish in one pass to a review file. If something is impossible, deliver the rest and say so.

Report back in under 300 words: the review file path, the SHOTS table, the BANNED list, known defects
with frames, and anything the conductor must know.

---

## type: Kinetic typography, f504 to f1188 (21.0 to 49.5 s)

Build on `../../bobwiseman-airplane-type/` (`js/ui.js`, `js/look.js`, `js/gl.js`, `type.html`;
`check.mjs`, `render.mjs`). Keep the finish (edge channel split, grain, scanlines, vignette, bloom on the
accent only) and the interface grammar. Drop the plane entirely.

LOOK: ground #0a0908, type #ece6d8, accent #ff4a1c, greys #77736b #ebe2cc. Fonts Archivo (wide weights),
JetBrains Mono, Instrument Serif, from Google Fonts as type.html loads them. Bloom only the accent.

LAYOUT (720x1280): a 48 px margin all round; big words live in a 624 px wide column; interface panels
are 560 px wide, centred; the readout strip at the bottom 120 px. At most four big words per line, three
lines per shot; the longest line in the section is "a self-perpetuating, unconscious form of brainwashing"
which is split, never shrunk below 56 px.

SHOTS (frames from cues.json, snapped to onsets):
1. f504-f600 "Okay, yes. We are bored. We're all bored now." A terminal prompt types `> status:`, then
   BORED stamps in with a rubber-stamp slam (scale 1.3 to 1.0 in 5 frames, 2-frame hold on impact).
   "all bored now": a roster of `bored` lines scrolls up, every row the same word.
2. f600-f760 "has it ever occurred to you, Wally, that the process that creates this boredom": a loop
   diagram draws itself: PROCESS -> BOREDOM -> PROCESS, arrows in the accent; the loop starts to turn.
3. f760-f900 "may very well be a self-perpetuating, unconscious form of brainwashing": the loop spins up;
   the words dim to 40% on "unconscious"; a progress bar labelled BRAINWASHING fills to 73% and keeps going.
4. f900-f1010 "created by a world totalitarian government based on money, and that all of this is much
   more dangerous than one thinks": a gauge labelled MONEY pegs into the red; an error pop-up:
   `DANGER: higher than one thinks`, with a glitch tear on "dangerous".
5. f1010-f1090 "And it's not just a question of individual survival, Wally": a radar sweeps, one blip.
6. f1090-f1150 "but that somebody who's bored is asleep": the screen dims to sleep mode, a slow breathing
   LED, the words sink.
7. f1150-f1188 "and somebody who's asleep will not say no": a dialog box with two buttons [ YES ] [ NO ].
   NO greys out on "no"; the cursor drifts toward YES. Hold on it to the end (36 frames minimum after "no";
   the section end is f1188, so the hold runs to the end of the file).

BANNED to start: random glitch everywhere (glitch only on "dangerous"), words sliding in from the side,
drop shadows, gradients, more than one accent, any plane or aircraft, Matrix rain.

---

## papersilhouette: Coloured paper silhouettes, f2548 to f3384 (106.0 to 141.0 s)

Build on `../../bobwiseman-in-her-dream/js/cut/` (`kit.js`, `cut.js`, `cast.js`, `shots/`; `check.mjs`,
`render.mjs`, `index.html`). Read `../../bobwiseman-in-her-dream/STORYBOARD-cut.md` if present for the
look bible. Reuse the paper, shadow, grain and puppet machinery; write new shots and a new cast.

LOOK: matte cut paper lit from the front, soft drop shadows, grain and mottling; at most four colours a
frame besides the ground; paper on twos; people are profile silhouettes in one colour each, jointed,
never rocked stiffly; no faces (a closed-eye crescent only on a big head); no text. Palette to start:
ground #f4ead6 (cream) or #1d2852 (night), figures #17204a, wall #7e3b2f or #1d2852, accent #f1b23a
(the seed), one more of your choice. Nothing from In Her Dream's story: no family, no gold rings, no sun
halo, no birds, no orange.

LAYOUT (720x1280): the tall frame is for rising things. Skyline and wall rise from the bottom; the big
head fills the top two thirds in shot 3; the hand fills the bottom half in shot 4. 60 px safe margin.

SHOTS (frames from cues.json, snap to onsets):
1. f2548-f2700 "I think that New York is the new model for the new concentration camp": a cut-paper
   skyline rises tower by tower on slots from the bottom (overshoot 1.06), then a wall builds in front
   of it, brick by brick, each brick carried in by a small figure in profile.
2. f2700-f2830 "where the camp has been built by the inmates themselves, and the inmates are the guards,
   and they have this pride in this thing they've built": on "guards" each bricklayer turns in profile
   and gains a cap silhouette; on "pride" they stand on the wall, hands on hips, chests out.
3. f2830-f3130 "They've built their own prison. And so they exist in a state of schizophrenia, where
   they are both guards and prisoners, and as a result, they no longer have, having been lobotomized,
   the capacity to leave the prison they've made or to even see it as a prison": one big head in profile,
   two paper layers; on "schizophrenia" the layers slide apart (one capped, one bare) and back; on
   "lobotomized" a strip lifts off the crown; on "see it as a prison" bricks close over the head as an
   iris until only a slit is left.
4. f3130-f3384 "And then he went into his pocket, and he took out a seed for a tree, and he said, this is
   a pine tree. He put it in my hand, and he said, escape before it's too late": a big open hand in
   profile from below; a second hand drops one seed (the accent colour) into the palm on "seed"; on "pine
   tree" the seed shows a tiny pine; on "escape" a pine silhouette shoots up through the brick iris and
   the bricks fall away past the camera; hold the pine and the open hand to f3384.

BANNED to start: 3D lighting, gradients, faces, a stiff figure rocking as one piece, cute proportions,
more than four colours, any In Her Dream motif.

---

## table-city: Fresh direction, cut-paper table that becomes a city, f1800 to f2544 (75.0 to 106.0 s)

Build on `../../indieagent-paper-depth/` (`js/paper.js`, `js/scenes.js`, `js/main.js`, `tools/still.mjs`,
README). Reuse the paper bake, lit cut edges, baked shadows, multiplane camera and the pop-up fold. Write
new scenes and no musician.

LOOK: textured card with a lit cut edge, each plane casting a soft shadow on the plane behind; torn edges
with a white core; five or more planes at real depths; one slow camera move per scene, always drifting;
scene changes inside a paper object, never a fade; no faces, no text. Palette to start: #35366f #f2b38a
#6c66a5 #5f8350 #23636b #e9ae3a #7e3b2f #1f2755 plus a cream tablecloth. The candle is the key light,
warm, from the centre of the table; the room beyond is navy.

LAYOUT (720x1280): the table is seen from above and slightly in front; the camera starts high and tilts
down to three-quarter as the city rises, so the towers use the frame's height. 60 px safe margin.

SHOTS (frames from cues.json, snap to onsets):
1. f1800-f1950 "And when I was at Findhorn, I met this extraordinary English tree expert who had devoted
   his life to saving trees": a dinner table from above: two plates, two glasses, cutlery, a candle, a
   bread basket, a small potted pine sapling at the table's edge. The camera drifts. On "saving trees"
   the sapling grows one tier.
2. f1950-f2110 "He just got back from Washington, lobbying to save the redwoods. He's 84 years old, and
   he always travels with a backpack, because he never knows where he's going to be tomorrow": the
   sapling grows into a redwood taller than the glasses; on "backpack" a napkin folds itself into a
   small pack and rests against the pot; the candle flame leans toward the tree.
3. f2110-f2300 "And when I met him at Findhorn, he said to me, where are you from? And I said, New York.
   He said, ah, New York, yes, that's a very interesting place. Do you know a lot of New Yorkers who
   keep talking about the fact that they want to leave but never do?": on "New York" the plates, glasses,
   bottle and salt rise on paper layers into a skyline, the glasses lit from inside by the candle; the
   knives and forks stand up around the table's edge as a fence; the camera tilts down to three-quarter.
4. f2300-f2544 "And I said, oh, yes. And he said, why do you think they don't leave? I gave him different
   banal theories. He said, oh, I don't think it's that way at all": tiny paper figures (profile, one
   colour, no faces) walk from the towers to the cutlery fence and turn back, twice; the camera pulls up
   and back to show the whole table as a walled city on a cream cloth, the redwood outside the fence;
   hold the wide to f2544.

BANNED to start: a plain fade, flat unlit paper, a face, the musician, a cute toy-town palette (keep it
warm but sombre), text labels, more than one camera move per shot.

---

## swift-line: Night-sky line film, f3840 to f4728 (160.0 to 197.0 s)

Build on `../../bobwiseman-swift-noimage/` (`scene/ihd_9x16.rb` is the 9:16 reference, `scene/miles.rb`
the first test, `scene/finish_cues.rb` the finish template, README for timings and traps). The renderer
is makevoid's motion-graphics-music-video-skill-noimage (MIT). It is not cloned on this Mac: clone
https://github.com/makevoid/motion-graphics-music-video-skill-noimage to
`/Users/robin/Code/novadiem/indieagent/secondunit/motion-graphics-music-video-skill-noimage/` (a sibling
of mv-projects, outside the worktree), read its README and the toolbox notes below, build the Swift
renderer with Homebrew Ruby (`/usr/local/opt/ruby/bin` on PATH, `bundle config set --local path
vendor/bundle`). Toolbox notes (rheos/secondunit-videos `toolbox/swift-noimage-skill.yaml`): skip
ImageMagick and tile sheets with ffmpeg; the renderer crops to --width/--height instead of scaling, so
render at scene size; output comes out 1 to 2 frames short of what you ask, and with JOBS above 1
vfx:render can fail with "Invalid VFX frame interval", so use JOBS=1 for that step; 860 frames at 1080p
took 36 s with JOBS=5 at nice 15. Do not run Demucs or any stems step: this is speech, not a song. Do not
run media:stems_local. Your project dir for the renderer goes in `tests/swift-line/work/` (gitignored).

LOOK: thin glowing lines on navy #0A0E24 / #0D1636, line colour #F2E8D5, one gold light #FFC531 that
means the human, one hot accent #FF5A1F, cool #7FD6FF for the robots. One continuous camera for the
whole section: a pull-back, strokes a fixed width on screen. A live readout runs throughout and only
tells the truth the speech just told. Sound and VFX cues come from events the scene reports, mixed well
under the voice (effects at least 18 dB below the dialogue; the voice must stay fully intelligible).

LAYOUT (720x1280): the readout is a 100 px strip at the top (mono, small caps); big poster words, if any,
fill the middle band and never cover the gold light; 60 px safe margin.

ONE SHOT, one pull-back (frames from cues.json, snap to onsets):
- f3840-f3990 "See, I think it's quite possible that the 1960s represented the last burst of the human
  being before he was extinguished": one line-drawn human figure, gold, standing on a street at the bottom
  of the frame, a little heat shimmer; the readout reads `YEAR 1960`.
- f3990-f4130 "and that this is the beginning of the rest of the future now": the year ticks forward
  fast; the camera begins to pull back; the street extends up the frame.
- f4130-f4315 "that from now on, there'll simply be all these robots walking around, feeling nothing,
  thinking nothing": cool-lined robots (simple jointed figures, boxy heads, no faces) walk in streams
  along the streets; the poster words FEELING NOTHING then THINKING NOTHING slam in once each and leave;
  the gold figure is one dot in the crowd.
- f4315-f4560 "And there'll be nobody left almost to remind them that there once was a species called a
  human being, with feelings and thoughts": the pull-back reaches the city grid, then the coast; the
  readout adds `HUMANS 1`; the robot streams become lines of traffic.
- f4560-f4680 "and that history and memory are right now being erased": the readout `MEMORY 100%` drains
  to 0% on these words; line by line the city's drawing un-draws (strokes retract) as the pull-back
  continues to the whole planet.
- f4680-f4728 "and soon nobody will really remember that life existed on the planet": the planet is a
  thin circle with one gold dot; on "planet" the dot goes out; the readout reads `LIFE 0 RECORDS`; hold
  the dark circle to f4728.

BANNED to start: a rocket, an odometer, a musician, any sung-lyric reveal band, lines of varying width,
more than one camera move, flashes (no more than 3 per second anywhere), robots with faces.
