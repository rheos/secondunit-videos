# Kurzgesagt reference profile (the flat-vector science-explainer manner)

Built 2026-10-26 (rheos/secondunit-videos#333). A study of the flat-vector explainer language that
Kurzgesagt made famous, read through one code-only recreation of it: Finn Ardley's (@finnardley) post
of 2026-10-24, "If the sun vanished today", 11.6 s, every frame written in code with Opus 5.5
(https://x.com/finnardley/status/2114188068500508998). It exists so a session building an IndieAgent
explainer, or any fact-driven short, can borrow the language without borrowing the studio's work.

This is a profile of a manner, not of a person. Kurzgesagt is a studio (Munich, YouTube channel
"Kurzgesagt - In a Nutshell", https://www.youtube.com/@kurzgesagt, https://kurzgesagt.org). We studied
Finn's code version, not the studio's films frame by frame, so every look rule below is read off his
clip plus general familiarity with the channel, and is labelled inference.

## Start here

- `AGENT-DIRECTION.txt`: the one-page "make this fact visible" pass. Give it a claim and a shot
  budget; it returns the one number, the bodies, the wavefront, and how the number stays honest.
- `STYLE-BRIEF.txt`: the surface (gradient night, grain, bodies with one highlight and a rim,
  tracked-caps labels on leader lines, odometer numbers) as a build spec with rejects and checks.
- `STUDY-finn-sun-vanished.md`: Finn's clip shot by shot at 4 fps, what it does well, and the two
  places it goes wrong (a flat map pasted on the planet, a countdown that disagrees with screen time).

## Our use of it so far

| Where | What | Record |
|---|---|---|
| `indieagent-flat-explainer-test` | 13 s, 16:9: a drummer hits a cymbal at a festival; light reaches the back of a 100 m field at once, the sound front takes 0.29 s (shown 10x slower, labelled). Odometer tied to the front's position; heads nod as it passes. Draft 1; Robin: "the look lands" (2026-10-26). Look `flat-explainer`. | rheos/secondunit-videos#333 |

## Rights

No frames from Kurzgesagt or from Finn's clip are committed here. The clip was downloaded to a
scratch folder for study only. Our test uses its own subject, palette, characters and compositions;
nothing in it is the studio's bird, characters, exact palette or any shot's layout. Credit for the
code recreation that prompted this profile goes to Finn Ardley; the manner is Kurzgesagt's.

## Fact and inference

Fact: what Finn's clip shows (sampled at 1 and 4 fps, timings in the study), the caption claim that
it was made in code with Opus 5.5. Inference: everything about why the look works, which parts carry
it (we think the grain carries most), and every rule in the style brief.
