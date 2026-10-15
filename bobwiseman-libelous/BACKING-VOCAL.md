# The backing singer's "libelous" (Bob's note, 2026-10-14)

Bob (Messenger, 2026-10-14): the backing singer sings "libelous" in the background and it's hard to make out;
could the word slip in and out each time, or a small singer appear. Robin: sound it out in text, LIB then EL then
OUS, the way she draws it out. Issue: rheos/secondunit-videos#118.

## Where she sings it

Three times, each one a single drawn-out word of about 5.4 s, three held notes with two vowel changes. The three
are almost the same length (LIB 1.5 s, EL 1.9 s, OUS 2.0 s), so it is one sung figure used three times.

Song seconds, frames on the 24 fps grid (`floor(t * 24)`), onsets snapped on her own stem:

| # | Where | LIB | EL | OUS | Note ends | Bob at the same time |
|---|---|---|---|---|---|---|
| 1 | intro, before the first verse | 7.48 (f179) | 8.97 (f215) | 10.90 (f261) | 12.92 (f310) | nothing (his first line starts at 13.90) |
| 2 | outro, first held shout | 310.08 (f7441) | 311.56 (f7477) | 313.45 (f7522) | 315.62 (f7574) | line 127 ends on its "Libelous" at 310.25, then holds line 128 from 311.86 |
| 3 | outro, last held shout | 323.89 (f7773) | 325.42 (f7810) | 327.29 (f7854) | 329.25 (f7902) | line 130 ends on its "Libelous" at 323.00, then holds line 131 from 325.50 |

Reverb tails run on about 0.3 s past "note ends" (315.9, 329.7).

Nowhere else. Her stem has faint harmony traces at 22-27 s and 49-54 s, but they sit on Bob's words in those lines
(a doubled harmony), not on the title, and nothing in stanzas 3 to 12 rises above leakage.

## How it was found

The Demucs vocal stem (`source/stems/vocals.wav`) holds both singers, both centred (no stereo split to use).
Whisper on that stem never hears the word, which is Bob's point.

1. Lead/backing split of the vocal stem with the Mel-Roformer karaoke model
   (`mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956`, through `audio-separator`; run with uv, Python 3.11,
   torch 2.2.2, numba 0.60 / llvmlite 0.43 pinned for this Intel Mac). Output in `work/karaoke/`
   (`backing_roformer.flac` sha256 `eabe80d6...`, `lead_roformer.flac` `8546811...`). The faster MDX karaoke
   model (UVR_MDXNET_KARA_2) found the same three spans but left more lead in the backing stem.
2. Pitch and energy of both stems against the lines (`work/karaoke/pitch_roformer.png`): her voice is strong only in
   the three spans above.
3. Spectrograms of each span (`work/karaoke/spec_b1.png`, `spec_b2.png`): one held note, two clear vowel changes.
4. Onsets (`tools/bv/onsets.py`): LIB = where her stem's energy first clears 25 dB under its peak; EL and OUS =
   the strongest spectral change (40 ms apart) near each vowel change, which also sits in an energy dip
   (-10 to -15 dB). Whisper's word breaks on her stem (it mishears the word) land within 0.1 s of the same two changes.

Scripts: `tools/bv/onsets.py`, `tools/bv/pitch_plot.py`, `tools/bv/spectrogram.py` (run line at the top of each).
The split itself, from the project folder (the 900 MB model downloads on first use):

    uv run --python 3.11 --with 'audio-separator[cpu]' --with torch==2.2.2 --with 'numpy<2' --with 'onnxruntime<1.20' \
      --with numba==0.60.0 --with llvmlite==0.43.0 audio-separator source/stems/vocals.wav \
      -m mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt --output_dir work/karaoke

("Vocals" out of that is the lead, "Instrumental" is her.) About 18 minutes on this Mac at nice 15.

Check by ear before a final: the split between LIB and EL is a vowel change on a held pitch, so it is the softest
of the three boundaries.

## Look test on TV news (occurrences 2 and 3), 2026-10-14

Robin picked the TV-news version for the test (after the woodcut test below was built; the woodcut one is set aside).

- Page `looks/tv-r3c-bv.html` = `tv-r3c.html` plus `js/common/bv-onsets.js` and `js/tv/bv-r3c.js`. No existing file is
  edited: bv-r3c.js wraps `r3cProgram`, so her box is part of the bulletin picture and goes through the CRT like it.
- Each time she sings, a second inset box wipes on at the top right of the picture (the over-the-shoulder box's
  navy frame and pale rim), 0.32 s before LIB: her in a studio at a chrome microphone, eyes shut on the held note,
  the mouth shaped to each vowel and closing for a moment on each consonant. Under her, a navy caption band in the
  bulletin's own caption-generator type (white Futura, as on the calendar box): LIB, EL, OUS come up on her onsets,
  left to right, each flaring bright for 3 frames; a white bar grows after LIB and EL while she holds them, and an
  underline under OUS to her end. The box wipes off 0.7 s after her note.
- Second voice: white Futura in her own box at the top right, against the lead's black Courier on the canary
  teleprinter at the bottom. The type is about 27 program px cap (the wire copy's is 36).
- Audit (`node work/motion-lab/audit.mjs looks/tv-r3c-bv.html 308 331 --spec js/tv/bv-audit.spec.mjs --safe 0.05`,
  552 frames): her 6 syllables and the lead's 18 words on their onsets; syllables, hold bars and wire copy inside
  their containers and the 5% safe area; her box covers no bulletin face (12 heads a frame recorded) and never
  touches the wire copy; her syllables on no face; the wire copy off her face. All pass.
- Outside her spans the page renders byte-identical to `tv-r3c.html` (308.5, 317, 320.5, 330.8 checked).
- Review clip: `out/lib_tvnews-bvtest-v1_f07392-f07944_24fps_draft.mp4` (308-331 s, 720p, 0 bad frames, flash check pass).

Not done until Robin picks the treatment: occurrence 1 (the intro, on `tv-r3a.html`).

## Look test (woodcut, occurrences 2 and 3), 2026-10-14 (set aside: Robin chose TV news)

Woodcut, the default: its outro page already prints the held "Libelous" big, so it is the hardest place to add a
second voice without a collision, and the chapbook has the two tools a second voice needs (a red second plate and
roundel vignettes, as on the five-views page).

- Page `looks/woodcut-end-bv.html` = `woodcut-end.html` plus `js/common/bv-onsets.js` (the table above as data, for
  every look) and `js/woodcut/bv-end.js`. No existing file is edited: bv-end.js wraps `BLOCKS_E[6]` and `pageTypeE`.
- What it does, each time she sings: in the block's empty left sky a small roundel pops open 0.36 s before LIB with
  her in it (head and shoulders, eyes shut on the held note, the mouth shaped to each vowel and closing for a moment
  on each consonant, sound cuts breathing with her vibrato), and a hanging scroll unrolls beside her. Each syllable
  prints on the scroll in the red plate on her onset, one row each (LIB, EL, OUS), with the lead captions' 3-frame
  impression; a red rule grows after LIB and EL like a hyphen while she holds them, and under OUS through to her end.
  After the note the scroll rolls up and the roundel closes (gone 0.65 s after her end).
- Second voice by every cue: red not black, 54 px not 92/156, in the picture (top left) where the lead's lines are
  under it (bottom centre).
- Audit (`node work/motion-lab/audit.mjs looks/woodcut-end-bv.html 308 331 --spec js/woodcut/bv-audit.spec.mjs`,
  552 frames): her 6 syllables and the lead's 18 words on their onsets; every syllable and hold rule inside the
  scroll's ruled margins; no syllable on any face (crowd, couple, her own); no lead caption on any face; no syllable
  touching a lead caption. All pass.
- Outside her spans the page renders byte-identical to `woodcut-end.html` (308.5, 317, 320.5, 330.8 checked).
- Review clip: `out/lib_woodcut-bvtest-v1_f07392-f07944_24fps_draft.mp4` (308-331 s, 720p, 0 bad frames, flash check pass).

