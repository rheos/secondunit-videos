# Edit & Documentary and Evidence Films: what Mark Achbar and devweb can use

Sixteen of the 66 styles are built from real material, not drawn worlds. **Edit & Documentary** (8) cuts
real archive footage, photos and documents; **Evidence Films** (8) builds the picture from real data,
scans, imagery or CAD files. Both still use no video model: the footage is public-domain or CC BY archive,
and everything around it is drawn in code. These are the styles nothing in `looks/` covers well, because
every look we have is either drawn from nothing or an artist's own footage.

Read for this study: every STYLE.md in full, each DEMO.md, `demo/tools/`, `demo/CREDITS`, `FACTS.md` and
`SOURCES.md`. Nothing was run or downloaded.

## Verdict

- **Mark Achbar's reel: build two looks.** An archive light table (from `archive-lighttable`) and an
  evidence board on one clock (from `visual-investigation`). Take `kino-montage`'s collision moves and
  `newsreel`'s per-clip archive grade into them as vocabulary, not as looks of their own.
- **devweb: build two looks.** A marker briefing wall (from `briefing-board`) and marker analysis over
  screen recordings (from `telestrator`). Take `microscope`'s scale bar and dive, and `caption-news`'s
  sound-off and 9:16 rules.
- **Studio-wide: take the source discipline.** A four-part `FACTS.md`, a sources ledger that logs rejected
  candidates too, one script that writes every on-screen number, and a check that the script's numbers
  equal the measurements. These matter more than any look: Achbar's whole method rests on sourced numbers
  (`references/mark-achbar/AGENT-DIRECTION.txt`, CHECK).
- **Skip as looks:** `lidar-survey`, `white-model`, `data-physical` and `teardown` need a GPU for three.js
  depth of field, ambient occlusion or millions of points (their own renderer warns software WebGL is about
  6 times slower), and fit a client only now and then. Keep their moves. `countdown` and `city-symphony`
  are one-beat tools, not looks. `news-package` suits IndieAgent more than either target client.

## The sixteen, one by one

| Style | What it is | Our closest | Match | Achbar | devweb | Verdict |
|---|---|---|---|---|---|---|
| `archive-lighttable` | Real scans (glass negatives, telegrams, clippings) on a cool backlit table; a loupe lands and the object changes state inside the lens | `paparazzi`, `scrap` (both with a vintage finish) | partial | **best fit** | moderate | **Build** (Achbar) |
| `visual-investigation` | Footage, photos, documents, sound and maps of one event on one shared clock; uncertainty drawn as ≈, "inferred", dashed | `diagram-plate`, `blueprint`, `paparazzi` | partial | **best fit** | strong (postmortems) | **Build** (Achbar, devweb) |
| `briefing-board` | A filmed whiteboard wall: photo cut-outs pinned with magnets, marker ink in three colours that each carry a meaning, the whole wall revealed last | `diary`, `type`, `diagram-plate` | partial | good (argument sections) | **best fit** | **Build** (devweb) |
| `telestrator` | Sports-analysis marker on real footage: watch at speed, freeze, draw one finding, roll on | `doodle-on-footage` (characters, not analysis) | partial | low-medium | **strong** (screen recordings) | **Build** (devweb) |
| `kino-montage` | Archive printed as ink-and-paper duotone with one red, cut on a machine beat; two images collide into a third idea | `woodcut`, `scrap`, `ministry`, `cutout` | partial | strong (his own register) | medium | Take the moves |
| `newsreel` | 1920s newsreel: archive in the gate, intertitles, period voice | `newsdesk`, `hose`, `filmleader`, `hj-sepia` | partial | high for period claims | low | Take the archive pipeline |
| `caption-news` | Sound-off social news: footage full bleed, captions slammed in chunks, a source tag on every number | `type`, `flat-explainer` | partial | weak as a look | strong (9:16) | Take the rules |
| `satellite-briefing` | Public-domain Landsat graded to analyst grey, white hairline measurements, one continuous zoom from orbit | `surveyplate`, `blueprint` (no real imagery) | lack | strong (claim vs ground) | weak | Keep for a land story |
| `data-physical` | Real statistics as stacked objects at exact scale on a crafted base, shot like a product | `relief-box`, `gameboard` | partial | good (profits, wages as coins) | moderate | Moves only; GPU-heavy |
| `microscope` | One continuous dive into a real slide; scale bar and readings from the file's metadata | none | lack | narrow | vocabulary very useful | Take the dive and scale bar |
| `countdown` | A real event's last minute, uncut, in split-screen cells that merge at zero | none (`filmleader` is a motif) | lack | one beat (the Doomsday Clock plate) | vocabulary | One-beat tool |
| `city-symphony` | Time-lapse city montage cut to a score, archive beside today | none in code | lack | interstitial | low | One-beat tool |
| `white-model` | A white massing model of a real place from open building data, data projected on it as light | `devweb-world`, `playa-3d` | lack | niche (urban stories) | weak | Skip; GPU |
| `lidar-survey` | Real airborne laser points; the canopy peels away by height | none | lack | niche (land history) | poor | Skip; GPU |
| `teardown` | A real product from its CAD files, exploded on one axis and labelled | `flat-explainer`, `blueprint` | partial | weak | hardware topics only | Label grammar only; GPU |
| `news-package` | A modern TV news package: rundown, strap, split-flap board, spec card | `newsdesk`, `outlinecartoon`, `surveyplate` | partial | low | medium | IndieAgent, see `STUDY-styles.md` |

## For Mark Achbar

His current film, *Romancing the Atom*, rests on Robert Del Tredici's photographs and pairs the early atom
with AI (`references/mark-achbar/README.md`, `STUDY-romancing-the-atom.md`). Our test reel is seven
plates in the blueprint look, and its rule already fits this study: archive photos are never recoloured;
paper mount, push-in, iris only. Four styles speak to it.

### Archive light table (build first)

Real archive objects lie on a cool backlit table: negatives and film transmit light, paper glows at its
edges. A loupe is the door into each object; inside the lens, and only there, the object changes state.
Catalogue numbers, dates and titles are pinned to each object, and every reading quotes the source's own
line. The style bans sepia, halftone and ageing overlays: the age is in the objects. That is the one thing
none of our archive-flavoured looks (`paparazzi`, `scrap`, `newsdesk`) does, and it is the register a
documentary director would trust.

Vocabulary to take:
- **The loupe as the door.** About 2.5 times magnification, slight pincushion and a little per-channel
  fringe at the rim, a black ring with a clear skirt, a short scale-up on landing with a shadow. A
  negative develops to positive only inside the lens, from its centre.
- **The line lights up.** One line brightens, the rest dims, an underline draws, the number lifts into a
  reading card with its catalogue source under it.
- **Two records side by side.** Two caption cards with crops of the original wording, held until both are
  read, then one is struck. That is Achbar's two-column logic (MC02, TC01 in `devices.md`) as a native move.
- **The table becomes the index.** On the last pull-back each object's tag flies into one list.
- **Measuring on the photograph.** A perspective ruler on the ground plane, labelled schematic when it is.
- Never magnify a scan past about 1.5 screen pixels per scan pixel.

Engine note: theirs is WebGL2 quads with one fragment shader (light, CPU-safe). The loupe can be done in
canvas2d as a magnified, barrel-warped copy drawn inside a clip circle, which fits our `__frameJPEG`
cloud render.

Don't take: the Wright brothers, the 57-versus-59-seconds story, the telegram, the first-flight plate, the
orange and table-white pair.

### Evidence board on one clock (build second)

Every source of one event (footage, photos, documents, sound, a map) laid on one shared clock so they check
each other. The camera never moves; layouts change on cuts with a 3-4 frame white flash; only drawn things
animate (circles drawn clockwise, leaders, plans stroke by stroke). One accent colour that only ever points.

Vocabulary to take:
- **Uncertainty is drawn.** ≈ on inferred times, the word "inferred" on reconstructed camera positions,
  dashed boxes for what is unresolved, "schematic" on anything not to scale. Our reel can tag generated or
  reconstructed material the same way, which keeps AI on screen obvious.
- **Known / unresolved**: two columns, ticked boxes against dashed ones.
- **Then versus record**: a period claim in its original sound, then a card striking the wrong words.
  Eisenhower's 1953 recording, already in our reel, is exactly this material.
- **Freeze, circle, magnify**: a loupe cropped from the same source pixels, never past 1:1.
- **Dots for people**: one dot each, turning to open red rings one by one, one large number. Their
  restraint rules (no slow motion of fire or impact, no full-screen flames, no sound effects on deaths,
  near-silence after the impact) are what keep an atom film out of mushroom-cloud kitsch.
- **Map to plan with a view cone**: a survey map pushes in to a measured plan showing where a photograph
  was taken from. Useful for placing a Del Tredici photograph without showing it in a spec piece.
- At most five sources on one board; few words per frame; one short source tag per piece.

Don't take: the Hindenburg, its 16-cell schematic, the wind chart, the board as laid out.

### Collision moves from `kino-montage` (vocabulary, not a look)

*The Corporation* argues by graphic collision; this style is built on it. Take: **A against B until a
card states the idea**; **the document is marked, not quoted** (a red marker bar over the exact sentence in
the full-resolution scan); **the document becomes the chart** (drawings keyed off the page and stood on one
ground line to scale); **counters with dated anchors** (only end values and dated anchors are facts, and
every counter carries its unit); the cut rule (adjacent shots differ in direction, value or geometry; never
two documents in a row); accelerating by halving, never under three frames; one section where the score
stops and a real recording carries the cut alone. Leave the full red-and-ink Soviet-poster surface: on an
atom film it reads as propaganda pastiche.

### Archive pipeline from `newsreel`

`demo/tools/prep.py grade()` (one level set per clip, never per frame), the gate used as a window for soft
archive instead of stretching it, document underlines placed from OCR word boxes, and grain only at the
mux. `audio/mix.py period_voice()` makes a narration sound like a 1940s soundtrack; use it only where the
reconstruction is clearly ours, never passed off as archive. Their jaunty 1920s tone is wrong near deaths
and test casualties; their own STYLE.md says so.

### One beat from `countdown`

Our reel has a Doomsday Clock plate, and Mark's shoot includes the Bulletin's CEO
(`mark-achbar.md` memory). The style's wall-clock variant (a known zero, a clock that flips at zero),
"planned versus heard" (what officials said against what happened) and a provenance badge per cell fit one
beat. Not a look.

### Rights, before any of this touches his film

- Their whitelist is PD, CC0 and CC BY. "No known restrictions", the Library of Congress's common label, is
  not public domain; the light-table demo argues each item from the author's death date.
- Their public-domain reasoning is American (published before 1931; federal works; published without a
  notice before 1978). *Romancing the Atom* is made with Knowledge Network and TVO, so any archive item
  needs a Canadian check before broadcast use. For a spec piece, keep to items whose status holds in both.
- Hearst, Pathé, Movietone and Paramount newsreels are not public domain even when uploaders tag them so;
  Universal Newsreels via NARA are.
- `demo/tools/sru.py` (archive-lighttable) reads the Library of Congress catalogue through its SRU service,
  because loc.gov item pages sit behind a Cloudflare challenge. Store each raw record beside `FACTS.md`.

## For devweb

devweb shorts explain a real bug a builder actually hits, open on the viewer's habit, and run 60 to 180 s
(`devweb-practical-topics`, `devweb-episode-rules` memories). Two styles fit as looks; two more give moves.

### Marker briefing wall (build first)

A real-looking whiteboard: enamel with window light and ghosts of old marker, prints pinned with magnets,
marker ink that draws itself. Ink colour carries meaning: graphite for names, blue for measurements, red
only for the decision. The camera rides lines from fact to fact; only at the end does it pull back to the
whole wall, which was designed as one poster from the start.

How it maps: the failing request drawn as a ruled line; timeouts as dimension lines in real milliseconds;
retries as magnets that clack on and pop off; the wrong first fix erased to a ghost (about 7% remains);
a stamp for the verdict, only after the whole item and its limit have been held at least 2.5 s; the wall
revealed last as the article's diagram. Screenshots of real terminals pin on as prints. It is plain
canvas2d with scene JSON (`demo/kit/board.js`, `kit/batch.mjs`), so it renders on our runners and suits a
series.

Take also: before the reveal, never more than 60% of the board width in frame and never both side edges
(`demo/tools/camcheck.mjs` enforces it); one shared grade and one light direction for mixed photo sources;
`rescheck.mjs` (no photo shown above its native resolution).

Don't take: the river, the ship, the four bridge types, the plan-above-elevation layout.

### Marker over screen recordings (build second)

Watch the bug happen at speed, rewind, freeze, then draw: one finding per freeze, at most two groups of
lines. Dashed for what should have happened, solid for what did. Three role colours that never change
meaning (ours, theirs, the gap). A stopwatch that counts real frames for a latency or double-submit window.
Overlays share the picture's transform, so they never slide. `demo/tools/homography.py` flattens a phone or
whiteboard filmed at an angle given four known points. Our `doodle-on-footage` tracks drawings to footage
already; this is the analytical register of the same idea.

Don't take: football, the club and broadcaster names, the pundit packaging.

### Moves from `microscope`, `caption-news` and `visual-investigation`

- **The dive** (microscope): one continuous log-spiral camera from the whole to one point, with a scale
  bar that jumps 1-2-5 and a magnification readout that clicks at each level with a focus breath. For
  devweb: a month of latency, one slow hour, one request, one log line (1 day, 1 h, 1 s, 1 ms).
- **Counting the colour** (microscope): a scan front crosses a window and counts what it passes, raw
  counts shown below. For failing requests in a window.
- **The document says it** (caption-news): the real changelog, issue or postmortem PDF, highlighted at its
  real coordinates (`pdftotext -bbox`) before the number is believed.
- **9:16 is its own layout, not a crop** (caption-news): caption under a footage band, chunks stacked.
- **Few words per frame, one short tag per source** (visual-investigation). That answers the labels
  nobody explained on devweb episode 4.
- **Known / unresolved** for a postmortem's open questions.

## Source discipline, for every factual film

Each of the sixteen demos carries the same files. Take them as the house standard for the Achbar reel and
devweb (proposed in `STUDY-director-technique.md` too):

- **`FACTS.md` in four parts** (`visual-investigation/demo/FACTS.md` is the best of them): (1) every
  on-screen line and narration claim with a source key; (2) each source with its quoted wording; (3) the
  film's own inferences, each with how it is marked on screen; (4) material used as picture only, not as
  a factual source. Evidence styles add (5) values the film measured, with method, inputs and the script
  that reproduces them.
- **A sources ledger that keeps the rejects** (`briefing-board/demo/sources/candidates/candidates.json`:
  35 photos looked at, 6 used, each with licence evidence and sha256). `footage.py` (in every Edit &
  Documentary demo) searches Internet Archive, Commons and NASA and logs licence, author and dimensions to
  `SOURCES.jsonl`; `city-symphony/demo/tools/used.py` writes which source seconds were used back into it.
  Our reel keeps this by hand in `BUILD-STATE.md`.
- **One script writes every on-screen number** to a JSON the page only reads (`lidar-survey`
  `build_data.py`, `white-model` `prep.py`). No number is typed into a scene.
- **A check that the narration's numbers equal the measurements** (`microscope/demo/tools/export.mjs`
  fails the build on a mismatch).
- **Per-line speech check cut from the final film** (`visual-investigation/demo/tools/final_asr.py`): a
  whole-film Whisper pass drifted and lost words, so each line is cut out and checked alone.
- **`rhythm_report.py`** (kino-montage, briefing-board): motion energy per half second on the finished
  file, flat stretches, cuts and hit alignment. An objective version of "nothing freezes while the music
  plays".

All of these are MIT. Anything copied keeps LemoLab's notice beside it.

## Licence notes

- Code and docs: MIT. **The demo films and stills are CC BY 4.0 (LemoLab), not MIT**; every third-party
  asset keeps its own licence (`demo/CREDITS`). Three narration tracks are excluded from both, including
  `news-package`'s (Doubao TTS). We take code and rules, never a demo's pictures or sounds.
- Credit-required packs inside demos: MuldjordKit drums (CC BY 4.0), Salamander Grand Piano (CC BY 3.0),
  3DBAG building data and OWID statistics (CC BY 4.0).
- `teardown`'s STEP importer uses `occt-import-js` (LGPL-2.1): fine as an offline tool, never bundled.
- The "LemoLab × Claude Opus 5.5" end cards belong to their demos only.
