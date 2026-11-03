# Look: pacing

Measured 2026-11-02 for the devweb look bible (look-bible step 1, topic `pacing`). Main references: Robin's picks
in our own genre, the 12 corespear shorts (narrated diagram explainers, 124-153 s) and the two Jam With AI shorts
(talking head with code, 60 s and 111 s). Cinetic's four films count for picture pacing only (no narration; kiln's
audio transcribes to zero words). The 20-shorts study (`refs/omi-style-bible-numbers.md`) is a third, text-only
reference. Ours: episode 1 draft 6 (the approved oner) and episode 5 finish d2. Scripts, transcripts, data and
sheets: `.bureau/runs/20261102-devweb-look-bible/look/pacing/` in this worktree (called `PACING/` below). The
transcripts there are study notes: never quoted on screen, in a script or in a description.

## 1. Verdict

Our picture keeps up with the references. Our narration does not: Chris talks faster than any reference voice, then
stops for half a second at every full stop, and our scripts put a full stop every five or six words. The biggest gaps:

1. **Pause time.** Silence between words longer than 0.25 s: ours **13.5-16.5 s per minute** of speech (27-33 gaps
   a minute), corespear **2.9 s/min** (median; range 1.3-5.5; 8.1 gaps a minute), Jam With AI 5.7-6.0 s/min, the 20
   shorts **under 1 s per whole video**. About a quarter of our speech span is silence; corespear's is 5 %.
2. **Pause per full stop.** Median gap after a sentence: ours **0.52-0.54 s**, corespear **0.20 s** (0.14-0.24).
   After a comma or colon: ours **0.32-0.36 s**, corespear 0.19 s (0.13-0.28). 89-94 % of our full stops are
   followed by more than 0.25 s; corespear 35 % (17-49 %).
3. **Sentence length.** Median words per sentence: ours **5-6** (scripts: ep 1 **5**, ep 5 **8**), corespear
   **11.25** (8.5-14), the 20 shorts 13.5. Sentences of four words or fewer: ours **34-47 %**, corespear **5 %**
   (0-11 %). Full stops per minute: ours **22.6-28.1**, corespear **15.3** (14.0-18.0).
4. **Net rate, and why speed is not the lever.** Words per second over the speech span: ours **2.65-2.69**,
   corespear **3.10** (2.78-3.45), the 20 shorts 3.7. But with the long gaps taken out, Chris talks at **3.42-3.71
   words/s**, corespear at **3.26** (2.96-3.53), Jam at 2.80-2.93. Raising ElevenLabs speed would make Chris's words
   even faster and leave the pauses as they are.
5. **Dead time at both ends.** Voice onset: ours **0.66-0.68 s**, corespear **0.10 s** in all 12, Jam 0.00-0.22 s.
   Film end after the last word: ours **4.72-4.75 s** (the ~/devweb mark), corespear **0.43 s** (0.35-0.69), Jam
   0.03-0.41 s; the 20 shorts end on the last word.

Picture pacing is not a gap. Counted by eye, ours runs **1.0-1.3 picture events per second** including caption
swaps (0.5-0.7 without them), corespear **0.8-0.95/s**, cinetic 0.6-1.1/s (detector). The one picture difference is
stillness: corespear holds a dead-still frame (no pixel moves over 0.33 s) for **40 %** of its frames, with the
longest still a median **4.1 s** (2.6-7.3) while the voice keeps going. Ours is never still (**0.3-2.5 %** of frames,
longest **0.33-1.0 s**), and neither is cinetic (2-10 %, longest 0.33 s) or the 20 shorts (camera holds 10 %). Keep
ours; corespear's stillness belongs to its flat-diagram look, not to the quality bar.

## 2. Method

- **Transcripts** (`PACING/transcribe.py`, out `PACING/tx/*.json`). faster-whisper `small`, CPU int8, English,
  word timestamps, beam 5, no VAD, one file at a time under `nice -n 15`. Same model and settings on our two masters'
  mixed audio, so ours and theirs share one method. Check: our `vo/words.json` (small.en on the dry take) gives
  14.3 s/min of gaps on ep 5 against 13.5 s/min from the master: the method agrees with itself within 1 s/min.
- **Narration numbers** (`PACING/speech.py` → `speech.json`, `speech_summary.txt`). Speech span = first word start
  to last word end. Gaps = next word start minus word end. Articulation rate = words / (span minus gaps over
  0.25 s). Sentences split on Whisper's `.!?`. Words/s per 10 s window for the rhythm range.
- **Gaps by boundary** (`PACING/boundaries.py` → `boundaries.txt`): gap after a full stop, after `,:;`, inside a
  clause.
- **Sentences in our scripts** (`PACING/script_sentences.py` → `script_sentences.txt`): exact text from ep 1
  `vo/take.json` and ep 5 `vo/script.json`.
- **Voice onset and silent tail** (`PACING/onset.py` → `onset.txt`): 20 ms RMS of the mix; onset = first window
  over 25 % of the median of seconds 1-10. Whisper's first-word times clamp to 0.00 s without VAD, so onsets come
  from this, not from the transcripts.
- **Hook, pivot, ending** (`PACING/structure.py` → `structure.txt`): first four and last two sentences with times,
  every question, and word 3-5-grams that recur in three or more videos with their place in the speech span.
- **Picture activity** (`PACING/activity.py`, `activity2.py` → `PACING/act/*.npz`). Every video at 30 fps, gray.
  `activity.py`: 135x240, share of pixels that moved more than 10/255 frame to frame and across 10 frames (0.33 s,
  so slow fades count). `activity2.py`: 270x480, the camera's integer shift between the two frames removed by phase
  correlation first, 12 % border dropped. Caption bands masked where noted (`_m`): Jam y 0.70-0.84, ep 1 y 0.53-0.66,
  ep 5 y 0.86-0.97. Cinetic's 16:9 films are squeezed to the same grid; only shares are compared.
- **Events and stills** (`PACING/events.py` → `events.json`, `events_c.json`, `act/*.events.txt`). An event is a
  peak of the 0.33 s change that rises at least 0.3 % of the frame (and at least double) above the lowest value of
  the previous 0.5 s; peaks within 8 frames merge. A still frame changes under 0.2 % over 0.33 s.
- **By-eye checks** (`PACING/sheets/check_*.jpg`, 1-2 fps strips). Against eye counts the detector finds about 70 %
  of corespear's and ep 1's events (corespear 92-101 s: 5 of 7; corespear uZo 20-40 s: 13 of ~19; ep 1 10-30 s: 14 of
  ~20). On ep 5 it is blind: the camera moves through a tall 3D column with parallax, so 22 % of the frame changes in
  every 0.33 s even with the shift removed, and it reported 16.9 s and 25 s with no event where the sheets show a
  caption swap or a card change every second (`check_ep05_25-47.jpg`, `check_ep05_108-130.jpg`). Ep 5's event rate is
  therefore the eye count, not the detector's.
- **Sheets.** `sheets/first24s_ours-top_refs-below.jpg` (one frame per 2 s: ep 1, ep 5, then corespear and Jam),
  `sheets/strips_first60s.png` (first 60 s per video: grey = words, red = gaps over 0.25 s, blue = detector events,
  dark ticks = still frames).

## 3. Tables

### 3.1 Narration, per video

| Video | Dur s | Words | Words/s | Artic. words/s | Gaps >0.25 /min | Gap s /min | Longest gap s | Sentence median (p90) words | Sentences /min | Silent tail s |
|---|---|---|---|---|---|---|---|---|---|---|
| corespear G_ES2 | 141.8 | 443 | 3.14 | 3.25 | 6.4 | 2.17 | 0.50 | 12 (18) | 15.3 | 0.33 |
| corespear JA6l | 134.1 | 424 | 3.17 | 3.27 | 5.4 | 1.77 | 0.48 | 11 (21) | 15.3 | 0.35 |
| corespear Nj9n | 152.0 | 420 | 2.78 | 2.96 | 11.1 | 3.82 | 0.48 | 11.5 (20) | 14.3 | 0.31 |
| corespear PP3o | 152.9 | 458 | 3.00 | 3.15 | 7.9 | 2.82 | 0.74 | 10.5 (20) | 14.9 | 0.25 |
| corespear PbqC | 140.3 | 436 | 3.12 | 3.35 | 11.2 | 4.04 | 0.72 | 10 (18) | 17.2 | 0.31 |
| corespear WAGe | 140.8 | 418 | 2.98 | 3.14 | 9.4 | 3.04 | 0.56 | 13 (16) | 14.1 | 0.31 |
| corespear ZRcs | 129.3 | 395 | 3.07 | 3.23 | 8.4 | 3.08 | 0.60 | 12 (17) | 15.4 | 0.33 |
| corespear daZx | 152.0 | 467 | 3.08 | 3.39 | 13.5 | 5.50 | 0.88 | 12 (21) | 14.7 | 0.33 |
| corespear o87t | 126.9 | 375 | 2.97 | 3.24 | 13.3 | 5.05 | 0.58 | 8.5 (17) | 18.0 | 0.31 |
| corespear q-WN | 123.8 | 426 | 3.45 | 3.53 | 4.4 | 1.25 | 0.38 | 9 (20) | 18.0 | 0.35 |
| corespear rGlx | 133.0 | 436 | 3.29 | 3.40 | 5.9 | 1.97 | 0.52 | 14 (19) | 14.0 | 0.33 |
| corespear uZo2 | 140.0 | 454 | 3.25 | 3.35 | 5.2 | 1.75 | 0.54 | 11 (17) | 17.2 | 0.33 |
| **corespear median** | **140.2** | **431** | **3.10** | **3.26** | **8.1** | **2.93** | **0.55** | **11.25 (18.5)** | **15.3** | **0.33** |
| Jam 7sIF | 111.2 | 295 | 2.65 | 2.93 | 15.7 | 5.65 | 0.60 | 8 (15) | 16.7 | 0.09 |
| Jam DirB | 59.6 | 149 | 2.52 | 2.80 | 13.2 | 6.04 | 0.66 | 21 (32) | 7.1 | 0.27 |
| 20 shorts (study) | 31-78 | n/a | 3.7 (3.5-4.1) | unmeasured | unmeasured | < 1 s per video | unmeasured | 13.5 | unmeasured | 0 (ends on the word) |
| **ours ep 1 d6** | 45.3 | 109 | **2.69** | 3.71 | **32.5** | **16.5** | 0.66 | **5 (7)** | **28.1** | 2.47 sound, 4.75 after last word |
| **ours ep 5 d2** | 129.6 | 331 | **2.65** | 3.42 | **26.9** | **13.5** | 0.74 | **6 (13)** | **22.6** | 2.76 sound, 4.72 after last word |

Words/s per 10 s window: corespear 2.1-4.0 (median of minima 2.55, of maxima 3.6); ours 2.2-3.3.
From `vo/words.json` instead of the master: ep 1 2.65 words/s, 15.6 s/min of gaps; ep 5 2.67 words/s, 14.3 s/min.
Our scripts' exact sentence lengths: ep 1 median 5, p90 10, 44 % of sentences four words or fewer; ep 5 median 8,
p90 14, 33 %.

### 3.2 Gap by boundary (median s; share over 0.25 s)

| | After a full stop | After a comma/colon | Inside a clause |
|---|---|---|---|
| corespear (12) | 0.20 (0.14-0.24); 35 % (17-49 %) | 0.19 (0.13-0.28); 28 % (7-69 %) | 0.00; 0 % |
| Jam (2) | 0.29-0.44; 70-100 % | 0.26-0.40; 53-86 % | 0.00; 0-1 % |
| ours ep 1 | **0.52; 94 %** | **0.36; 83 %** | 0.00; 0 % |
| ours ep 5 | **0.54; 89 %** | **0.32; 83 %** | 0.00; 0 % |

### 3.3 Hook, pivot, ending

| | Corespear (12) | Jam (2) | 20 shorts (study) | Ours ep 1 | Ours ep 5 |
|---|---|---|---|---|---|
| Voice onset | 0.10 s (all 12) | 0.00-0.22 s | frame 1-4 | 0.68 s | 0.66 s |
| Hook kind | a question in 11 of 12 (10 as sentence 1, 1 after an 8-word framing line); 1 a design task | an analogy claim; a "let me show you" promise | a paradox stated as fact, 20 of 20 | paradox claim | paradox claim |
| First sentence ends | 4.5 s median (2.0-6.7) | 4.2-6.9 s | 10-16 words | 2.38 s (6 words) | 2.68 s (7 words) |
| First answer or claim | the next 1-3 sentences, 4-12 s; 3 of 12 say outright that this is the answer, by 8.6 s | n/a | sentence 1 | sentence 1 | sentence 1 |
| Concrete scenario | an "imagine" setup in 11 of 12, first at 11.7 s median (4.2-30.6) | 1 of 2, 7.1 s | setting in 1-2 lines | the Nelson weather ask, 5.3 s | the tools set-up, 3.3 s |
| Pivot into the reason | no fixed opening pivot; the repeated phrase is the recap, the 3-word "the mental model", in 10 of 12 at 88-95 % of the speech | none | "You see," in 14 of 20 | none | "Here's why." at 37.5 s, 30 % of the speech |
| Questions | 0-3 per video | 1-2 | ~1 mystery beat | 0 | 1 (at 89 %) |
| Last line | the model restated, 8-35 words (median 15) | a summary; one ends on a chatbot sign-off | ironic payoff, 1-2 short sentences | a 5-word rule | a 6-word callback to the hook |
| After the last word | 0.43 s median (0.35-0.69) | 0.03-0.41 s | 0 s | 4.75 s | 4.72 s |

### 3.4 Picture events and stills

| Video | Events/s (detector, a floor) | By eye | Still share | Longest still s | Longest stretch with no event s | Hard cuts |
|---|---|---|---|---|---|---|
| corespear (12), median | 0.55 (0.32-0.84) | 0.78 (92-101 s of G_ES2), 0.95 (20-40 s of uZo2) | 0.40 (0.15-0.76) | 4.1 (2.6-7.3) | 7.1 (3.2-17.5) | 0 (0-2) |
| Jam 7sIF / DirB | 0.28 / 0.35 (talking head always moves; detector not meaningful) | unmeasured | 0.00 / 0.01 | 0.30 | 10.6 / 6.6 | 15 / 9 frames over 50 % change |
| cinetic quire / kiln / ledgerly / halden (shift removed) | 0.83 / 0.68 / 1.10 / 0.67 | unmeasured | 0.03 / 0.02 / 0.03 / 0.09 | 0.33 | 2.4 / 3.0 / 2.1 / 2.8 | kiln 3 |
| 20 shorts (study) | camera moves 0.60/s (6.0 per 10 s) | unmeasured | camera hold 10 % of frames | unmeasured | unmeasured | 0-1 per video |
| **ours ep 1 d6** (shift removed, captions masked) | 0.62 | **1.0** (10-30 s, captions included) | 0.025 | 1.00 | 5.3 | 0 |
| **ours ep 5 d2** | detector blind (0.20) | **1.14** (25-46 s), **1.26** (108-127 s); without captions 0.48 and 0.74 | 0.003 | 0.33 | by eye under 2 s | 0 |

Caption swaps from the code: ep 1 has 16 in 40 s of speech (0.40/s), ep 5 has 86 in 124 s (0.69/s). Corespear has
no burned captions; Jam swaps one word at a time (2.5 a second).

## 4. Recipe in our stack

We take the references' rhythm, not their words, structure phrases or look. Nothing below copies a reference line,
title or recurring phrase.

### 4.1 Writers' room (`workflows/write-short-script.md`)

- **Sentence length:** median 10-13 words, p90 about 18. At most 10 % of sentences four words or fewer, and at most
  one run of fragments per short, kept as a deliberate beat (ep 1's "Ask. Run. Read." is that one beat). Join the
  rest with a comma, "and" or "so": "Nothing is saved. Nothing errors." becomes one sentence.
- **Full stops:** 14-17 a minute of speech (ours runs 22.6-28.1). Each full stop costs about 0.2 s after
  tightening (4.3) and 0.53 s before it.
- **Length formula:** replace "seconds = words ÷ 2.85" with **words ÷ 2.65** while takes are untightened (measured on
  ep 1 and ep 5; the 2.87 measured on episode 4 did not hold) and **words ÷ 3.05** once `tighten` is in the kit (the
  simulation on ep 5's take gives 3.07).
- **Hook:** keep the paradox claim as sentence 1, and keep it landing by 2.7 s: ours already beats corespear's
  question hook (4.5 s) and matches the 20 shorts' formula. Put the concrete case within the next 1-2 sentences
  (ours: 3.3-5.3 s; corespear's scenario arrives at 11.7 s median).
- **Pivot:** land the turn into the reason by 25 % of the speech (ep 5's "Here's why." came at 30 %; ep 1 has none).
  Use one fixed series phrase once Robin picks it (series README); "Here's why." is already ours from ep 5 and is a
  candidate. The references' recurring phrases ("the mental model", "You see,") are theirs and stay out.
- **Recap:** one sentence at 88-95 % of the speech that states the rule in plain words (all 12 corespear shorts
  restate the model there), then the closing line. The last line stays our callback, 6 words or fewer, and the video
  ends on it.

### 4.2 Editor (`agents/modes/crew-editor.md`)

- **Voice onset 0.10-0.15 s.** The hook type is up on frame 0 already; the voice should not wait 0.66 s.
- **The close:** hold **1.0 s** after the last word (the existing minimum) and end; put the ~/devweb mark on screen
  over the last line or inside that 1.0 s, not after it. Target total after the last word: at most **1.5 s** (ours
  4.72-4.75 s; corespear 0.43 s).
- **Picture events:** keep 0.8-1.3 a second including caption swaps (ours 1.0-1.3, corespear 0.8-0.95 by eye), and the
  2 s no-dead-air rule: ours never goes still for more than 1.0 s and that matches cinetic. Do not copy corespear's
  4 s dead-still holds.
- **Captions** are about 0.7 a second on ep 5; after tightening the same captions will run about 15 % faster, so
  re-check the 0.3 s per word plus 0.5 s hold rule on the tightened take (`index.html` already warns under 0.45 s).

### 4.3 VO settings (`tools/devweb-kit/vo/vo.py`, `vo/align.py`): a proposal, Robin picked the voice

- **ElevenLabs speed: no change (keep 1.0).** Chris already articulates at 3.42-3.71 words/s against corespear's 3.26
  and Jam's 2.80-2.93. A higher speed would push the words past the references and leave the 0.53 s stops in place.
  Whether `eleven_v4` honours `voice_settings.speed` is unmeasured.
- **Add a pause-tightening pass**, a new kit script `vo/tighten.py` run between `vo.py` and `align.py`:
  1. Whisper the raw `voice.mp3` once (the same `small.en` settings as `align.py`).
  2. For every gap between words: after a full stop or question shrink it to **0.22 s**, after a comma or colon to
     **0.15 s**, leave gaps under those values alone. Cut from the middle of the silence with 10 ms fades so breaths
     at the edges survive.
  3. Keep marked holds: `script.json` gets an optional `"holds": ["X"]` list of beat ids whose lead-in pause stays
     natural, capped at 0.6 s (the pause before the closing line is the obvious one).
  4. Write `voice.mp3` (keep the raw take as `voice.raw.mp3`) and add `"tightened": {"stop": 0.22, "comma": 0.15}`
     plus the before/after seconds to `take.json`, then run `align.py` as now.
  Simulated on our takes (`PACING/tighten_sim.py`): ep 5 speech 124.9 s → 107.9 s (2.65 → 3.07 words/s), ep 1
  40.6 s → 33.8 s (2.69 → 3.22). That lands gap time near corespear's 2.9 s/min. Robin should hear it once on ep 5
  at 0.22 s and at 0.30 s per stop before it becomes the default: the felt quality of the voice is his call.
- **`align.py` LEAD 0.6 → 0.12 s, TAIL 4.4 → 1.2 s**, so the film starts on the voice and ends 1.0-1.5 s after it.

## 5. Top five changes, ranked by impact on how the short feels

1. **Tighten the pauses** (`vo/tighten.py`, 4.3): full-stop gaps 0.53 → 0.22 s; gap time 13.5-16.5 → about 3 s per
   minute; ep 5 would run about 108 s of speech instead of 125 s.
2. **Longer sentences, fewer full stops** (writers' room, 4.1): median 5-6 → 10-13 words; fragments 34-47 % → under
   10 %; full stops 22.6-28.1 → 14-17 a minute.
3. **Cut the dead tail** (editor and `align.py`): 4.7 s after the last word → at most 1.5 s, with the mark over the
   closing line.
4. **Start on the voice:** onset 0.66 s → 0.12 s (`align.py` LEAD).
5. **Fix the pivot's place and the recap:** the turn into the reason by 25 % of the speech on one series phrase
   Robin picks, a plain-words recap at about 90 %, then the callback line. Leave speed at 1.0 and the picture event
   rate as it is.
