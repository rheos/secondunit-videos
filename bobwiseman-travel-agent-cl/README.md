# Bob Wiseman: Travel Agent (on cleanline)

Travel Agent draft 21 moved onto the shared engine in `../cleanline/`. Same film, same frames: the parity proof is in `reviews/parity/`. The film's history, briefs, audits and Bob's notes stay with the original, `bobwiseman-travel-agent/` (drafts 6 to 21 on the `travel-agent-*` branches, PR #332), which still renders draft 21 on its own and is not changed by this folder.

- Song: "Travel Agent", from *In Her Dream: Bob Wiseman Sings Wrench Tuttle* (2024, Indie Pool).
- Clock: `source/travel-agent-2024.wav`, 48 kHz stereo, 403.42 s, sha256 `f270050ba780d5543fc0754e5e3337e799d82b2307f02d8d6e2c63272daae337`. 24 fps grid, 9682 song frames. The song is gitignored: copy it from the original project's `source/` and check the hash (`shasum -a 256 source/travel-agent-2024.wav`). The tools refuse any other file.
- Audio, lyrics and the storyboard (it quotes them) stay out of git.

## Files

| File | What it is |
|---|---|
| `film.config.js` | size, hold (twos), page, clock, and the looks per mode: `ill` fieldguide (or armink), `sch` blueprint |
| `clock.js` | the pinned song, word spans, sung lines, beats, and the `ohara` cue list (Mary Margaret O'Hara's stretches) |
| `film.html` | the page: config, clock, engine, looks, then the film's scripts |
| `js/ground.js` | the colour arc: each act's paper shifts (the engine's `groundTint` hook) |
| `js/props.js`, `js/shots.js`, `js/surreal.js`, `js/symbols.js`, `js/story.js` | cast, props, set-ups, the surreal layer, `buildShots()` |
| `js/acts/act-*.js`, `js/draft*.js`, `js/mvu/`, `js/ohara-echo.js` | the cuts per act and each draft's revisions, as they shipped in draft 21 |

What moved out to the engine: `js/kit.js` (now `cleanline/js/kit.js` and the fieldguide and blueprint looks), `js/main.js` (`cleanline/js/frame.js`), `js/ink2.js` (`cleanline/looks/fieldguide.js`), `js/arm.js` (`cleanline/looks/armink.js`), `js/data.js` (`clock.js`), `check.mjs` and `render.mjs` (`cleanline/bin/`). Three lines of film code changed: `shots.js` reads `CLOCK.words`, `act-d.js` reads `CLOCK.beats`, and `ohara-echo.js` reads `CLOCK.cue('ohara')`.

## Running

Once: `cd ../cleanline && npm install`. Then from this folder:

```bash
open film.html                                                          # preview: click plays, the bar scrubs, ?t=95.5
node ../cleanline/bin/check.mjs out/sheet.jpg --events cuts,lines        # contact sheet at every cut and line start
node ../cleanline/bin/render.mjs 0 end out/ta_film-cl_f00000-f09682_24fps_draft.mp4 --scale 0.6667   # 720p draft
node ../cleanline/bin/render.mjs 0 end out/ta_film-cl-arm_draft.mp4 --qs look=armink --scale 0.6667    # robot-arm look
```

Looks: `?look=armink` (add `&ground=plain` for cream paper) swaps the paper scenes to the navy-ink look; `?ink=1` is the draft 15 line.
