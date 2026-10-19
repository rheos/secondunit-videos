# Romancing the Atom: graphics test reel (test 01)

A 60 s spec piece for Mark Achbar's documentary *Romancing the Atom* (Invisible Hand Productions; nuclear
weapons and AI as parallel risks). The aim is to show him the kind of animated sequences we could make for
the film. Issue rheos/secondunit-videos#252. Made 2026-10-19, 0 credits.

## Facts on screen, with sources

| On screen | Source |
|---|---|
| Strauss, 1954: "electrical energy too cheap to meter", Chairman, U.S. Atomic Energy Commission | Widely documented (speech to the National Association of Science Writers, 16 Sep 1954); also cited by WION on Altman's essay |
| Altman, 2025: "Intelligence too cheap to meter is well within grasp" | blog.samaltman.com/the-gentle-singularity (June 2025), sentence checked on the page |
| Atoms for Peace 3¢ stamp, 1955 | Wikimedia Commons, `File:Atoms_for_Peace_stamp.jpg`, public domain |
| Trinity, New Mexico, 16 July 1945, 05:29 | DOE photo, Commons `File:Trinity_Detonation_T&B.jpg`; date and time are the standard record |
| December 1945, ENIAC's first job: a secret problem from Los Alamos | APS News, "December 1945: The ENIAC Computer Runs Its First, Top-Secret Program" (the problem was from Los Alamos; that it concerned the H-bomb is likely but still classified, so the film says only "a secret problem") |
| Warhead curve 1945-2026, peak 70,374 in 1986, 12,187 in 2026 | FAS estimates via Our World in Data, `grapher/nuclear-warhead-stockpiles` (World series, fetched 2026-10-19, in `js/data.js`). FAS's own page says "approximately 70,300 in 1986" and "roughly 12,187 ... as of the beginning of 2026" |
| Doomsday Clock: 1947 seven minutes; 27 Jan 2026, 85 seconds, the closest yet; the statement calls for international guidelines on AI | thebulletin.org/doomsday-clock (85 s, 27 Jan 2026, AI guidelines); the 1947 setting of 7 minutes is the clock's well-known first setting |
| Red flags table | Editorial, not a data claim |

The clock is our own drawing, not the Bulletin's artwork. The hand sweeps straight from 7 minutes to 85 s; the
real setting moved back and forth over the decades, and the reel does not claim otherwise.

## Look and method

Canvas code on the Travel Agent engine (`js/kit.js` is a copy of `bobwiseman-travel-agent/js/kit.js` with the
mono font changed). Main look: Travel Agent's schematic blueprint (navy, lavender/cyan linework, hex lattices,
glowing nuclei, magenta saved for the one hot phrase per plate). Words: Airplane on the Highway's kinetic type
(`js/type.js`, after `bobwiseman-airplane-type/js/ui.js`). Plate IV: Airplane's oscilloscope (`js/scope.js`,
after `bobwiseman-airplane-scope`, redone in 2D with 'lighter' compositing instead of the WebGL pass).
Archival photos are never recoloured (`js/photos.js`): paper mount, push-in, iris only.

Plates and handovers (score seconds, bars of glassy-art-pop take-02 at ~88 BPM):

| Plate | Time | Hands over by |
|---|---|---|
| 0 Title: atom, a heart constructed around the nucleus, ROMANCING / the atom | 0-9.1 | orbits shrink onto the stamp's printed orbits |
| 1 The promise: stamp + Strauss quote, then the stamp's orbits run into a neural network + Altman quote | 9.1-20.1 | the network's output node irises open onto Trinity's fireball |
| 2 The same lab: Trinity, then ENIAC + "a secret problem from Los Alamos" | 20.1-28.3 | fireball closes to a point, ENIAC opens from it, closes to the scope's beam spot |
| 3 Scope: tube powers on, the real warhead curve, sync lost, the trace falls into an atom | 28.3-39.2 | the atom arrives in blueprint ink and flattens into the clock rim |
| 4 Clock: 1947 seven minutes, sweep, zoom to 85 s | 39.2-47.4 | the camera travels down the same sheet |
| 5 Red flags form, SOUND FAMILIAR? stamp | 47.4-55.6 | camera travels down again |
| 6 Title block colophon | 55.6-60 | end |

## Files

- `index.html` the page; open it in Chrome to play with the score (click), arrows scrub, `?t=SECONDS`.
- `js/data.js` warhead series and beat grid (generated). `js/shots.js` the seven plates.
- `assets/pd/manifest.json` every archival photo with Commons page, licence, author, sha256. The JPEGs are
  gitignored; `python3 -I fetch-pd.py` gets them back. Only trinity, eniac-beck-snyder and the stamp are used;
  the others (Crossroads Baker, Castle Bravo, Oppenheimer and Groves, Eisenhower at the UN, a second ENIAC) are
  there for the next test.
- `assets/song.wav` (gitignored) = score-library `glassy-art-pop/take-02.mp3` (sha256 starts 2bbe26d1), 48 kHz.

## Running

    node check.mjs out/sheet.jpg 4.8 11 21.5 ...      contact sheet
    node check.mjs --full out/full 46.2               full-size stills
    node render.mjs 0 60 renders/<name>_720p.mp4 4 24 0.6667

`check.mjs` and `render.mjs` launch Chrome with `--allow-file-access-from-files`; without it the local photos
taint the canvas and `toDataURL` throws.

## Draft log

- Draft 1 (2026-10-19): `renders/atom-reel_test01_draft1_720p.mp4`. Not uploaded, not sent; Robin watches first.
