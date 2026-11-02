# DIRECTOR.md and TECHNIQUE.md against our review rules

Lemo-Opuscar's two guides, read against the video-production skill's `references/review-checklist.md`,
`references/art-direction.md`, `references/motion-lab.md` (sound section) and `SKILL.md` rules 4 to 8.
For each of their rules: do we already have it, have part of it, or lack it, and is it worth taking.

Their guides are written for an agent that makes a 30 to 60 s film alone, from one prompt, with one fix
round and no client. Ours come from Robin's corrections on long music videos for a real artist. So a lot
of ours has no counterpart in theirs (artist notes are the brief, audio frozen, lock characters before
paid transitions, never overwrite review files, patch spans, 720p drafts), and some of theirs does not fit
us (ask the user once and never again; one fix round then deliver; their China map rule). The useful part
is below: rules about sound, pace, reading time, camera and performance that are written as numbers, plus
two files every factual film should carry.

## Verdict

Take nine rules and two files into the skill (list at the end). Skip their workflow (brief once, one fix
round, deliver) and their installer. Keep our page contract; add one optional global (`__texts`) to it.

## Rule by rule

### Story and direction (DIRECTOR §1 to §5)

| Their rule | Ours | Verdict |
|---|---|---|
| Pick one or two benchmark works for this style and this topic before writing; list "what to learn" and "what not to take" | `compare-to-the-reference` (when Robin names one), `build-a-language-not-a-copy`, the `references/` profiles. No per-film benchmark step and no written "don't take" list | **Take, small.** Two lines in the look bible: learn / don't take. It is our language-not-copy rule made checkable |
| Treatment first: three candidate structures, pick one and say why; the first idea for a style is usually its cliché | `fresh-direction-per-video`, look exploration on one short stretch, "find the one image" | **Take for explainers and devweb.** A song fixes a music video's structure, so there it is moot. For a devweb short or an IndieAgent explainer, three structures (a journey, a before/after, a list that turns) cost five minutes and stop the default |
| One subject, one goal, one turn; hook in the first 3 s; an ending that echoes the opening | Kevin Ngo profile (ending rhymes with opening), devweb rules (open on the viewer's habit) | Have it |
| One "native move" per film (a moment only this medium can do), placed at the emotional peak | `transitions-follow-an-element`; In Her Dream's protected moments | Have it in spirit. "Native move" is a good name for what Robin protects; worth a field in look files (`STUDY-packaging.md`) |
| One gag readable at thumbnail size beats three | The "reads as" test, art-direction §5 | Have it |
| Prove the look: model sheet (turnaround, 3-4 expressions, 2-3 key poses) plus two style frames, with the real drawing code | Cast line-up at full size (art-direction §2), `keep-the-approved-character-drawing` | Have most of it. Their expression set is a useful minimum for a new character |
| "Not the demo again": compare the film with the style's demo on six axes (structure, opening, signature shot, camera path, score shape, ending); at least four must differ | `fresh-direction-per-video` says it; nothing measures it | **Take.** Our looks get reused (woodcut in Airplane, Me and Jimi, Libelous; cut paper in In Her Dream, Clap Hands, First Night Out). Before a second film in an existing look goes to Robin, list those six for both films; four must differ |

### Sound (DIRECTOR §6, TECHNIQUE §4 to §6)

Songs are the clock and never touched, so none of this applies to a music video's soundtrack. It applies
to devweb, IndieAgent explainers, Shadow Tales, the Achbar reel, anything where we make the sound.

| Their rule | Ours | Verdict |
|---|---|---|
| Every visible action has a sound, matched to its material | SKILL.md rule 7: sound on the animation events themselves (Robin, 2026-10-19, Achbar reel); drawing functions report cues | Have it, and ours is better engineered (cues come from the drawing code, so a retime can't desync) |
| Three layers: ambience, foley, music; duck music under dialogue and key foley | motion-lab: hits 3 to 6 dB over the bed | Partial. **Take the ambience layer**: our explainers tend to have foley and music and no room tone |
| At least two real silences or near-silences, before the turn or the peak; the first sound after one is among the most important in the film | Blindfold listen (the sound needs shape) | **Take.** It turns "has shape" into something a reviewer can count |
| Sound as a transition at least twice (J-cut, L-cut) | Nothing | **Take** for any film with scenes and our own sound |
| No generic piano and strings; score in the style's own instruments | Nothing written | **Take** as one line. Their STYLE.md files each carry a sound palette (`STUDY-packaging.md`) |
| Compress TTS before balancing; balance by RMS, voice about 10 dB over music | Nothing for narration | **Take** for narrated explainers |
| Low end: 20-120 Hz about 3 dB under the rest, no pad notes below MIDI 48, bass with 2nd and 3rd harmonics so it speaks on phones | `mixcheck.sh`: energy under 60 Hz plays as nothing on a phone | Partial. **Take the harmonics trick and the MIDI 48 floor** into the phone-band note |
| Numbers written out in the TTS text, as digits in the subtitles; every line transcribed back with faster-whisper until it matches (`core/tts/asr_check.py`) | Whisper used for song word timings only | **Take** for narrated films. faster-whisper is already installed |
| Final file: `ebur128` loudness, `blackdetect`, whisper again on the final mix | `badframes.py`, `flashcheck.py`, Kits.ai mastering for songs | Partial. Whisper on the final narrated mix is new; the rest we have |

### Rhythm and reading time (DIRECTOR §7, TECHNIQUE §3, `core/render/readcheck.mjs`)

| Their rule | Ours | Verdict |
|---|---|---|
| Cue map before animating; one timeline file that the score, mixer, subtitles and checks all read; a per-demo `cuecheck.py`, aiming at 0 ms | Audio as clock, `words.json`, beat-sync grid, cues.json | Have it |
| Vary the pace: one clear acceleration or deceleration, one breath (a long take or a held pause); a film at one even speed has failed | Drone camera never still more than 2 s; holds breathe | **Take.** We guard against stillness, not against monotony. Add it to the film-level critic's list |
| Subtitle held at least 1.8 s and at least spoken line + 0.6 s | No subtitle rule | **Take** for narrated films |
| After text finishes animating in, hold about letters / 15 + 1.5 s (English); a title card at least 4 s | `hold-after-last-word`: at least 1.5 s after the last letter, about 0.3 s a word for long lines; `holdcheck.py` in the Achbar reel only | **Take the formula and the check.** Ours is a floor; theirs scales with length (a 60-letter line needs 5.5 s on screen). Use both. The 4 s card applies only where a card exists (`no-title-cards` still holds for music videos) |
| `readcheck.mjs`: the page exposes `window.TEXTS(t)` (every visible text with its box); the checker steps through the film and fails any text held too briefly or not fully in frame | `holdcheck.py` reads `cues.json` plus a plate map, Achbar reel only | **Take the contract.** Add an optional `window.__texts(t)` to our `__ready` / `__frameJPEG` page contract and port the checker (MIT; keep the notice). It also catches text leaving the frame, which `text-fits-container` asks us to check by eye |

### Camera (DIRECTOR §8, TECHNIQUE §2)

| Their rule | Ours | Verdict |
|---|---|---|
| At least four different camera moves and real changes of framing; one signature shot | Drone camera for 3D; one punch-in per vignette on its key word; count transitions and centred compositions across the film | Partial. **Take the count of four** for 2D films: a side-on frieze film passes every check we have with one move |
| Transitions inside the medium (page turn, carved line, ink spreading), one grammar; no default fades or hard cuts | `transitions-follow-an-element` | Have it, and ours is more specific |
| At key moments the subject fills at least a third of the frame height | "Subject too small" is written nowhere | **Take.** A number a critic can measure on a still |
| Animate on twos where the style wants it, but keep camera and light smooth on every frame; a stepped camera reads as lag | Woodcut and tarot deck on twos; nothing says the camera stays on ones | **Take.** Check our on-twos looks: if the whole frame steps, camera included, that is the lag they describe |
| One world-to-screen function; anything that follows a subject (iris, zoom, spotlight) goes through it; never hand-typed screen coordinates | `out/probe.mjs` projects positions for checks | **Take as a build rule.** Their failure list names the bug: an iris or follow-cam that stops tracking once the camera moves |
| three.js depth of field silently breaks under an orthographic camera unless the depth pass uses `orthographicDepthToViewZ` | Nothing | Note for `devweb-world` and any ortho three.js look |

### Performance (DIRECTOR §9, TECHNIQUE §10)

| Their rule | Ours | Verdict |
|---|---|---|
| Anticipation, action, follow-through on every meaningful move; characters change emotion | `characters-not-marionettes`; paper-fox follow-through (references/leon-lin) | Have most of it |
| Blend every pose with keys and easing; never switch poses inside an `if` (a deliberate one-frame pop excepted) | Nothing written | **Take.** It is the cause of most of our marionette pops |
| Held props sit between the palms, at a depth between the two arms; a hand-over interpolates palm to palm; a rolling object turns by distance / radius | `props-real-geometry` (the guitar case) | **Take the two numbers** |
| Step through key actions at 0.2 s, enlarged | Full-size crops at three or four times of anything new | **Take.** A 0.2 s strip of every key action (hand-over, fall, hit) is what would have caught the floating hat and tube arms of the draft 23 driver (review-checklist, 2026-10-18) |
| Check every expression at final size, eyebrows above all ("worried" and "angry" are one flip apart) | Nothing | **Take** as a line under the "reads as" test |
| Shoulder: abduction, then flexion (the reverse crosses raised arms into an X); the girdle rises and moves forward as the arm lifts; don't outline the arm where it overlaps the torso | One outer outline; near arm behind the head (art-direction §5) | **Take the rotation order and the girdle rise**; the outline rule we have |

### Failures they saw most (DIRECTOR §10)

Subject too small or against the edge; too dark, or a colour on the same colour; subtitles over the
subject; a gag too fast to read; blank frames in transitions; a timed effect that doesn't track its
subject. We cover blank frames (`badframes.py`) and text in its container. **Take the other five as lines
in the film-level critic's list.** "Red on red" is the same failure as Robin's pale details on cream
(art-direction §5).

### Delivery and rights (DIRECTOR §11 to §13, TECHNIQUE §11)

| Their rule | Ours | Verdict |
|---|---|---|
| One fix round, then deliver | `revision-loop.md`, artist notes, Robin watches first | Skip; we have a client loop |
| `CREDITS` in every film: each third-party asset with source and licence | `secondunit/CREDITS.md` is a paid-generation ledger, not asset licences | **Take** for any film with fonts, samples or archive material |
| `FACTS.md` for any film that states facts: each claim with its source URL and the quoted wording, or the measurement that produced it | Achbar profile: every number on screen sourced; the reel's `BUILD-STATE.md` lists sources | **Take as the standard file** for the Achbar reel and devweb. It is the Achbar CHECK step as a file a reviewer can open |
| Only CC0, CC BY or OFL; public domain counts as CC0, "no known restrictions" does not; ODbL or share-alike only after naming the terms to the user | Gilliam profile: commit only public-domain material | **Take the "no known restrictions is not public domain" line.** Library of Congress items often carry that label; it matters for Mark's archive work |
| References teach grammar only; no existing works, brands or events unless the user holds the rights | `build-a-language-not-a-copy`, `describe-styles-not-titles` | Have it |
| Maps: no borders unless the film is about them; frame disputed areas out; credit the map data and its view | Nothing | **Take the general rule.** Their China-view section is written for their audience, not ours |
| Grain added at mux, not drawn in the page (faster capture, smaller files) | Grain often drawn in the page as part of a look's boil | Note only. Fine for static grain; our boiling paper and paint textures are the look and stay in the page |

## What to put into the skill

For whoever next edits the video-production skill; each is a line or two in the named file. These are
proposals for Robin; this study changed nothing in the skill.

1. **art-direction §1**: benchmark lines in the look bible (learn / don't take).
2. **art-direction §1**: three candidate structures for explainers and devweb; for a second film in an
   existing look, the six-axis "not the last film again" check (four of six differ).
3. **motion-lab, sound section**: an ambience layer; two real silences before the turn or peak; at least
   two J/L cuts; no generic piano and strings; TTS compressed, voice about 10 dB over music; bass with 2nd
   and 3rd harmonics, no pads under MIDI 48; every TTS line transcribed back before the mix.
4. **review-checklist, hold-after-last-word**: add letters / 15 + 1.5 s in total and subtitles at least
   max(1.8 s, speech + 0.6 s); a generic `__texts(t)` check (port `readcheck.mjs`).
5. **art-direction §6, film-level critic**: pace varies (one acceleration or deceleration, one breath); at
   least four camera moves in a 2D film; subject at least a third of frame height at key moments; subtitles
   never over the subject; no colour on its own colour.
6. **art-direction §4 or motion-lab**: on-twos looks keep camera and light on ones; one world-to-screen
   function for anything that follows a subject.
7. **review-checklist, frames**: a 0.2 s strip of every key action, enlarged; expressions checked at final
   size; poses blended, never switched in an `if`.
8. **review-checklist, props**: held props between the palms; rolling objects turn by distance / radius.
9. **SKILL.md delivery**: `CREDITS` (asset licences) and, for factual films, `FACTS.md` (claim, source URL,
   quoted wording) in the project folder.
