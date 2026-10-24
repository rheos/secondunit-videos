# Issue 119 · v8 working revision

## Visible changes

Six original engraved characters (owl scholar, flame-capped keeper, moth caretaker, fox dancer, fish mariner, hare messenger) replace the recoloured principal clones. A continuous textured mesh keeps sleeves and capes connected through head, arm and leg gestures. Their root origins and travelling packets share the same posed foot coordinates. The moth and owl are spaced to preserve both silhouettes.

The principal pair's branches recede between declarations, freeing their hands for steps, bows and offers. The fox bows and the owl answers; the fish overbalances and the keeper counters it. The first simultaneous arrival and first separate branch reveals, fifty-tree grove, underground camera and thick roots remain in place.

## Trumpet investigation: unresolved

The original sparse accents came from generic instrumental onsets, not verified trumpet transcription. Two instrument classifiers (YAMNet and PANNs Cnn14) and a spectral template were tested on the separated instrumental. Confidence was low and spectral matching also matched other instruments. Roughly 20–22 s and 140–142 s are candidate calibration passages, NOT confirmed trumpet intervals. No classifier threshold has been promoted to a verified score. The agent could inspect numeric/spectral data but could not independently listen through the available tools.

TRUMPET-REVIEW.html provides original/stem playback, a log-frequency spectrogram, frame stepping and start/stop marking with JSON export. One confirmed positive and negative passage is requested from Robin for calibration. The preview continues to use the legacy draft accents until a score is confirmed; full musical sync remains unfinished.

The runtime now supports explicit half-open [on, off) frame intervals in js/alchemy/trumpet-score.js, disabled while verified=false. In either mode, a recovering pose cannot emit sound cords. Playing pose, bell rays and gold cords use the same horn state. This plumbing is checked at note-on, note-off, preparation and recovery boundaries.

Model sources: Google YAMNet (https://www.tensorflow.org/hub/tutorials/yamnet); PANNs (https://github.com/qiuqiangkong/panns_inference). Local model weights and audio-derived evidence are not committed.

## Generated asset provenance

Builtin imagegen created assets/alchemy/ensemble-v8.png (1222 × 1287 RGBA) using source/alchemy/clothed-pair.png as the visual reference. Exact prompt: ENSEMBLE-v8-PROMPT.txt. Original generated file: /Users/robin/.codex/generated_images/01a13631-12d2-7112-82a6-537f19728d5a/exec-2fcf0fcc-3708-4f4b-9e24-a8857fe8d9c9.png. The atlas is copied without raster alterations; code deforms it at runtime. The six identities and scenes are original production designs, not attributed Mark von Ulrich works.

## Review status

Independent acting and film reviews found broken slice joints, detached roots, silhouette overlap and repetitive choreography. Repairs use continuous mesh deformation, shared posed roots, spacing and two bounded exchanges. Follow-up still review confirmed the three visual blockers resolved, then identified a fox-face overlap at 99 s; that pose now steps left. The seek audit exposed Metal-dependent bitmap resampling: identical source-pixel hashes and identical drawing commands produced different textures after a reverse seek. Software Canvas rendering produced byte-identical frames, so export and repeat-seek verification now use that path. Final validation results will be recorded after rendering. V7 remains available. This revision is not uploaded to YouTube.

## Completed v8 validation

- All 3,674 song frames pass the geometry/state audit; the first branch frames remain Sol 1363 and Luna 1423, with fifty trees across six depths and a returning underground camera.
- Seventy sampled frames are byte-identical after reverse seeks using software rendering. The exact-score boundary checks confirm no rays or playing state before note-on or after note-off, including pose recovery. Branch-free passages and new root-to-foot origins are checked.
- Full encoded review: 1280 × 720, 24 fps, 3,674 frames, 153.083333 seconds, stereo AAC. No bad-corner or dark frames, and no freezes longer than two seconds. The 62-frame encoded contact strip and the corrected 99 s / final 145 s details were inspected.
- Pinned audio is unchanged. Three decoded audio windows have 0 ms offset and correlations above 0.9995. General-luminance flash check passes (worst one flash/second); the checker does not measure saturated-red flashing.
- Local trumpet review controls were verified for frame stepping, start/stop marking, serialized cue output and undo. The temporary test interval was removed. This establishes tool behavior, not musical correctness.

Review movie: `out/att_alchemy-v8-full_f00000-f03674_24fps_draft.mp4`. Review page: `REVIEW-v8.html`. Musical calibration remains open; no confirmed trumpet score has been applied.
