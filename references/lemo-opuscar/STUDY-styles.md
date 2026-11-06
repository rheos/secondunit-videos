# All 66 styles against our looks

Every style in Lemo-Opuscar's `styles/README.md`, set against our 84 `looks/*.yaml` (origin/main,
2026-11-02). For each: the closest look we have, whether we already have its language, and which client it
would suit. Read from each STYLE.md (sections 1, 2, 8 and 9 closely, the rest skimmed; the sixteen Edit &
Documentary and Evidence Films styles in full, see `STUDY-edit-and-evidence.md`).

**Match:** `have` (we have this language under our own name; theirs may add a move), `partial` (a cousin;
the column says what theirs adds), `lack` (nothing like it).
**Clients:** Bob (Bob Wiseman's music videos), Achbar (Mark Achbar's documentary reel), devweb (developer
shorts), IA (IndieAgent explainers).
**GPU:** marked where a style needs three.js with heavy post. Our cloud render is CPU-only and the Mac is
an Intel with Metal; the library's own renderer notes that software WebGL runs about 6 times slower.

Totals: 7 have, 39 partial, 20 lack.

## Build first

Ranked for what each would do for a real client, weighted toward canvas2d (renders on our runners) and
toward a register nothing in `looks/` gives us. Each is a new language of our own, built on our own
subject; none takes a demo's story, composition or palette.

1. **Archive light table** (from `archive-lighttable`) for **Achbar**. Real archive objects on a backlit
   table, a loupe as the door into each, catalogue-true labels, no vintage grade. Our archive-flavoured
   looks all age the material; this one lets the objects carry the age. Loupe can be canvas2d.
2. **Evidence board on one clock** (from `visual-investigation`) for **Achbar**, and **devweb**
   postmortems. Every source on one clock, uncertainty drawn (≈, inferred, dashed), known against
   unresolved, restraint around deaths. Canvas2d.
3. **Marker briefing wall** (from `briefing-board`) for **devweb**, and an IA "how a tour gets booked"
   with real objects pinned up. Ink colours that mean something, the wrong fix erased to a ghost, the
   stamp only after a 2.5 s hold, the whole wall revealed last. Canvas2d, scene JSON.
4. **Marker over screen recordings** (from `telestrator`) for **devweb**. Watch the bug at speed, freeze,
   draw one finding; dashed for intended, solid for actual; a frame-counting stopwatch. The analytical
   cousin of our approved `doodle-on-footage`.
5. **A tour drawn as a transit map** (from `transit-map`) for **IA**. Each run of dates is a line, a shared
   bill is an interchange, a counter tallies the shows. Canvas2d ink; their final print step uses one
   WebGL plane, which can stay 2D.
6. **One line in motion** (from `one-line`) for **Bob**. A quiet song drawn as one unbroken line, where the
   pen stopping is the event (ink pools, the music drops out). Takes our approved `spiral-line-portrait`
   from a still to a performance. Canvas2d.

Next tier: **paper lantern** light through stacked cut paper (Bob; build in canvas2d on `shadow`'s
lamplight, not three.js), **urban sketch** colour arriving as an event (IA tour diary, Bob travel songs),
**redrawn footage** (the `silent-film` ink pass over real footage, so archive and drawn scenes share one
hand; Achbar, Bob), **chalkboard** write, wipe and rewrite in place (devweb; fold it into the briefing wall
as a move).

## Edit & Documentary (8)

Detail and verdicts in `STUDY-edit-and-evidence.md`.

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `caption-news` Caption News | `type`, `flat-explainer` | partial | devweb | Sound-off rules: captions slammed in 2-3 chunks, one keyword; a source tag on every number; 9:16 as its own layout |
| `newsreel` 1920s Newsreel | `newsdesk`, `hose`, `filmleader`, `hj-sepia` | partial | Achbar | One archive grade per clip; the gate as a window for soft archive; OCR-placed underlines; `period_voice()` |
| `countdown` Live Countdown Split-screen | none | lack | Achbar (one beat) | A known zero; cells that merge at zero; "planned vs heard"; a provenance badge per cell |
| `city-symphony` Time-lapse Symphony | none in code | lack | Achbar (interstitial) | Archive beside today in a counterpoint split; speed curves with frame blending; the brake and the hard stop |
| `visual-investigation` Visual Investigation | `diagram-plate`, `blueprint`, `paparazzi` | partial | **Achbar, devweb** | **Build.** One clock; drawn uncertainty; known/unresolved; four-part FACTS.md |
| `kino-montage` Constructivist Montage | `woodcut`, `scrap`, `ministry`, `cutout` | partial | Achbar | A against B until a card states the idea; the document marked, then turned into the chart; the conflict cut rule |
| `telestrator` Sports Telestrator | `doodle-on-footage` | partial | **devweb** | **Build.** Watch, freeze, draw one finding; dashed vs solid; role colours; frame-counting stopwatch |
| `news-package` Broadcast News Package | `newsdesk`, `outlinecartoon`, `surveyplate` | partial | IA | A rundown of dates ticked off; one strap that flips, never exits; split-flap board |

## Evidence Films (8)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `satellite-briefing` Satellite Briefing | `surveyplate`, `blueprint` (no imagery) | lack | Achbar | The printed claim map torn away to show the ground; grey grade, colour returns at the turn; a range line whose tip the camera chases |
| `briefing-board` Engineering Briefing Board | `diary`, `type`, `diagram-plate` | partial | **devweb**, Achbar, IA | **Build.** Meaning-coded ink; erase to a ghost; judgement held 2.5 s before the stamp; the wall as one poster |
| `lidar-survey` LiDAR Survey | none | lack | Achbar (niche) | Peel layers by a threshold on the beat; measured area bright, context dim. GPU |
| `white-model` Projection on White Model | `devweb-world`, `playa-3d` | lack | Achbar (niche) | Data as light on one neutral object; "the hole" (light only the answer set). GPU |
| `data-physical` Data Physicalization | `relief-box`, `gameboard` | partial | Achbar, IA | One unit = one object; counter tied to pieces landed; every tenth piece a pitched note. GPU |
| `teardown` Exploded Teardown | `flat-explainer`, `blueprint` | partial | devweb (hardware only) | Label grammar: accent index, name, one spec line, units always; one real motion. GPU |
| `microscope` Microscope Story | none | lack | devweb (moves) | The dive with a 1-2-5 scale bar and clicking magnification; counting by a scan front |
| `archive-lighttable` Archive Light Table | `paparazzi`, `scrap` | partial | **Achbar**, IA | **Build.** Loupe as the door; the line lights up; two records side by side; the table becomes the index |

## Hand-drawn & Painting (8)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `crayon-book` Crayon Picture Book | `crayon`, `diary`, `kawaii` | partial | Bob | Wax resist: white crayon invisible until a wash reveals it; a tooth and pressure model for crayon |
| `watercolor` Watercolor Brush | `water`, `fieldguide`, `kawaii` | partial | Achbar, IA, Bob | Palette as data (colour blends by a measured value across the map); a journal annotation layer |
| `ink-wash` Chinese Ink Wash | `charcoal`, `water` | lack | Bob | Ink-bloom transition (the next scene grows inside a spreading drop with a tide-line); dry-brush "flying white" |
| `impasto` Impasto Oil Painting | `brushsheep`, `paint`, `filmposter` | partial | Bob | Paint body as a height field; drop the light to raking at the peak so every ridge catches |
| `one-line` One-line Drawing | `spiral-line-portrait`, `armink` | partial | **Bob**, Achbar | **Build.** One path for the whole film; stopping is the event |
| `whiteboard` Whiteboard Explainer | none | lack | devweb, IA | The eraser rewinds (wiping a trail backwards undoes time); pen speed solved to land on the word |
| `urban-sketch` Urban Sketch, Pen & Wash | `armink`, `diary`, `fieldguide`, `water` | partial | IA, Bob, Achbar | Colour as arrival: wash spreads with a wet front, figures stay line until it reaches them |
| `chalkboard` Chalkboard | `charcoal` (other register) | lack | devweb | Write the wrong claim, wipe it in one pass, rewrite the right one in the same spot |

## East Asian Traditions (4)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `shadow-puppet` Shadow Puppetry | `shadow` (approved) | partial | Bob, Achbar | Coloured translucent leather (transmission, not black cut-outs); go behind the screen to show lamp, hands and rods |
| `ukiyoe` Ukiyo-e | `woodcut`, `tarotdeck`, `peacock-paper` | partial | Bob, IA | A series of views: one constant subject placed differently in each print; colour printed block by block |
| `papercut-red` Red Paper-cut | `silhouette`, `shadow`, `cutpaper` | partial | Bob | Scraps have a future (offcuts return as snow or stars); fold symmetry; swap pieces, never morph |
| `paper-lantern` Paper-cut Lightbox | `shadow`, `silhouette`, `paper-depth`, `relief-box` | partial | Bob, IA | Two windows, one light; per-layer backlight transmission. Their engine is three.js; ours would be canvas2d |

## Print & Printmaking (6)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `risograph` Risograph Print | `riso` (approved) | have | Bob, IA | Plates as narrative: the world gains an ink at each turning point; one canvas channel per plate |
| `halftone-dossier` Halftone Dossier | `paparazzi`, `gameboard`, `outlinecartoon` | partial | Achbar, devweb | Redaction bars that print over words and lift one by one; dot density as a mood dial; halftone step ≥ 14 px at 1080p (moiré) |
| `woodcut` Woodcut Print | `woodcut` (approved) | have | Bob, Achbar | Knife classes with pixel widths; skin carved white, features left black; a filter that turns a photo into form-following cuts; the mirrored block that reads true when pulled |
| `engraving` Copperplate Engraving | `engraving`, `alchemy`, `gilliam`, `fieldguide` | have | Bob, Achbar | The magnification roundel flown to the margin with a figure number; colour arriving as an event |
| `silkscreen-poster` Silkscreen Travel Poster | `riso`, `gameboard`, `circus`, `surveyplate` | partial | IA, Bob | Gig posters pulled on camera; an info band printed last; the series wall as the closing lockup |
| `printed-long-take` Printed Long Take | `woodcut`, `hj-scratch`, `drawn-playa` | partial | Bob, Achbar | The same place printed again: the top sheet peels to show next year's print |

## Graphic & Type (7)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `swiss-motion` Swiss Motion Graphics | `type`, `flat-explainer` | partial | IA, devweb | A strict grid where columns carry meaning; the one unsnapped element becomes the character |
| `spy-titles` 60s Spy Title Sequence | `cutpaper`, `papersilhouette` | partial | Bob, IA | Type is the set: each place is one line of credits and that line is its architecture |
| `art-deco` Art Deco | `pinball`, `circus` | partial | Bob, IA | Counted light (a bulb sign lights one letter per event); gold-line stroke recipe |
| `blueprint` Blueprint | `blueprint` | have | IA, devweb | The title block as story: the status field is the verdict, revision rows are the history |
| `stained-glass` Stained Glass | `stainedglass`, `nouveau` | have | Bob | The window's colour projected onto the floor, stretching as the sun moves |
| `pictogram-motion` Pictogram Motion | none | lack | IA, devweb | Beat-locked pictograms; the icon wall where every pictogram returns as one grid |
| `ascii-crt` ASCII / CRT Terminal | `type`, `scope`, `macpaint` | partial | devweb | Pictures made of glyph density; font size as the camera (push in by enlarging the grid) |

## Information & Keynote (8)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `dataviz` Data Storytelling | `diagram-plate` | partial | Achbar, IA, devweb | Axes grow with the story (the y axis arrives when the unit is first named); sonified data |
| `iso-infographic` Isometric Infographic | `diagram-plate`, `flat-explainer` | lack | IA, devweb | Isotype numbers: the same icons rearranged so totals add up visibly |
| `dark-keynote` Dark Tech Keynote | `type`, `flat-explainer` | partial | IA, devweb | Generated accumulation: the mess spawned by rule, faster and faster, then one action clears it |
| `living-screencast` Living Screencast | `call-toon`, `macpaint` | lack | IA, devweb | The product's real screens redrawn in DOM, a mascot standing on measured UI edges; HyperFrames-friendly |
| `hologram-hud` Sci-fi Hologram HUD | `scope`, `blueprint` | partial | devweb | Rolling digits computed from glyph noise as the payoff |
| `transit-map` Transit Map | `surveymap` (rejected), `blueprint` | lack | **IA**, devweb, Achbar | **Build.** The interchange that falls when a second line first reaches a station |
| `isometric-picture-book` Isometric Picture Book | none | lack | IA | Order lighting: places light up in the order they will be used before anyone moves |
| `circuit-board` Circuit Board | none | lack | devweb, IA | A process as current on copper: each stage a component, the light's change says what it does |

## Cartoon & Anime (4)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `rubber-hose` 1930s Rubber Hose Cartoon | `hose` (draft) | have | none new | The film as a physical object (title cards roll up like blinds). Robin's rule stands: no rubber hose for anything tender |
| `cel-anime-80s` 80s Cel Anime | `pinball`, `orb-cel` | partial | none strong | Colour-model change: one place at another hour by multiplying lit, shadow and line sets separately |
| `scifi-toon` Sci-Fi Sitcom Toon | `outlinecartoon`, `call-toon` | partial | devweb | Dialogue-comedy timing over drawn tiles |
| `midcentury-toon` Mid-century Cartoon | `submarine`, `storybook`, `crisp-line` | partial | IA, devweb | A numbered medallion stamps onto the step and the camera goes through it to the next |

## Games (4)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `pixel-rpg` 16-bit Pixel RPG | `16bit` (approved) | have | devweb | Palette collapse: colour depth drops a level per beat, or floods back through a dither wave |
| `hd-2d` HD-2D | `16bit`, `voxelloop` | partial | none strong | The carried light as a meter. GPU |
| `microgame` Microgame Frenzy | none | lack | devweb | The failure's material returns as the final answer; rounds that speed up |
| `game-show` Game Show Flat | `outlinecartoon`, `cutpaper` | partial | devweb | Call and response that speeds from quarters to eighths as the plot |

## Cinema & Eras (2)

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `silent-film` 1920s Silent Film | `hose`, `filmleader`, `rotoscope-haze`, `wakinglife` | partial | Achbar, Bob | Redrawn footage: one WebGL pass inks real footage so it shares a hand with the drawn scenes |
| `backrooms` Liminal Found Footage | none | lack | none (a VHS insert at most) | The on-screen display as plot: REC, battery and timecode as evidence. GPU |

## Materials & 3D (7)

All seven are three.js with heavy post; none suits our CPU runners as built.

| Style | Ours | Match | Clients | Worth taking |
|---|---|---|---|---|
| `brick-toy` Brick Toy | `voxelloop`, `claymation` (distant) | lack | none | Rebuild into something else: the same pieces rearranged become a new object |
| `paper-popup` Paper Pop-up Book | `paper-depth`, `cutout`, `scrap` | partial | Bob, IA | Pull-tab mechanisms (flipping slats, sliding strips) as old way / new way |
| `tilt-shift` Tilt-Shift Miniature | none | lack | none | The speed drop: time crashes from 40 times to real speed on one detail |
| `lowpoly-island` Low-poly Isometric Island | `orb-cel`, `rocket-portals`, `voxelloop` | partial | none strong | Building is composing: each piece plays a note as it lands, a sweep replays them as a melody |
| `glass-product` Glass Product Render | none | lack | none | Frost to clear: a frosted shell's roughness animates to zero |
| `memphis-diorama` Memphis Diorama | `relief-box`, `paper-depth`, `gameboard` | partial | IA | Squash, spring, then a wave: one landmark's bounce ripples a state change outward |
| `desktop-flythrough` Desktop Flythrough | `devweb-world`, `voxelloop` | partial | IA, devweb | Sticker pop: a flat sprite on a card stands up and extrudes into a toy on a sixteenth |

## Techniques that recur across many styles

Worth adopting in any look, whether or not we build one of theirs:

- **`render(t)` pure, every cache built on first use.** Frames that depend on which worker started where
  are their woodcut pitfall and our `scan-every-frame` incident. Seed per stroke.
- **Draw in canvas2d, finish in one WebGL pass.** Canvas writes data (pressure, ink density, cut mask,
  stroke time) into channels; one full-screen shader turns it into the material. Cheap on CPU. In risograph,
  crayon-book, shadow-puppet, woodcut, urban-sketch, ink-wash, stained-glass, silent-film.
- **Textures anchored to the world, not the screen,** with octaves crossfading on zoom and detail fading
  before it goes sub-pixel. Screen-fixed grain looks fake and bloats the encode.
- **Line weight decoupled from zoom.** Constant screen-space outlines, or width × zoom^0.65; close-ups go in
  a call-out circle at native scale (blueprint, one-line, midcentury-toon).
- **Model sheets rendered from the real engine** behind a page flag (`?sheet=1`) before any shot.
- **Characters on twos, camera and light on ones.** A stepped camera reads as lag.
- **Swap pieces, don't morph.** Faces and expressions as swapped parts; morphs read as rubber.
- **Load every font weight before measuring text** (`document.fonts.load`).
- **Encode-aware finishing.** Grain at the mux; `-tune grain` with a higher CRF on textured looks; white
  flashes capped at 0.5-0.6.
