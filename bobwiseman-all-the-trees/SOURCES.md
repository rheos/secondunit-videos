# Source ledger — All The Trees, alchemical look test

The historical artwork below is public domain. Downloaded scans, the AI repair, extracted PNGs and audio remain local and gitignored. Code and this ledger can be committed. No modern hand-colouring or editorial text from the source sites is reused.

| Local file under `source/alchemy/` | Work / supplier | Rights and use |
|---|---|---|
| `emblem30.jpg` | Michael Maier, *Atalanta fugiens*, emblem XXX, 1618 edition; engraving attributed to Matthäus Merian. [Brown / Furnace and Fugue plate](https://furnaceandfugue.org/atalanta-fugiens/emblem30.html). [1600 px scan](https://furnaceandfugue.org/assets/img/emblem-images_cropped/1600/emblem30.1600.jpg). | Public-domain 1618 original; faithful scan. The [Science History Institute catalogue](https://digital.sciencehistory.org/works/pc289j53n) identifies the work and marks its scans Public Domain. Used for clouds and as the basis of the modest figure repair. Credit: Brown University Library, Furnace and Fugue; Michael Maier / Matthäus Merian. |
| `emblem46.jpg` | Same book, emblem XLVI. [Brown plate](https://furnaceandfugue.org/atalanta-fugiens/emblem46.html), [scan](https://furnaceandfugue.org/assets/img/emblem-images_cropped/1600/emblem46.1600.jpg). | Public-domain original, faithful reproduction. Only the left eagle's body and two wings are used. Credit as above. |
| `fame-vico.webp` | Enea Vico, *Fame*, 1533–1567, after Francesco Salviati; Rijksmuseum. [Museum record and Public Domain designation](https://www.rijksmuseum.nl/en/collection/object/Faam--f6cfe675aa207874b6e51f26fa23e1ac), [persistent object identifier](https://id.rijksmuseum.nl/200267589), [1600 px scan](https://iiif.micr.io/AoKRs/full/^1600,1600/0/default.webp). | Public domain, per museum. Clothed winged trumpeter, separated into body, arm/instrument, wing and drapery. This is the related emblem/herald tradition specifically allowed by #119. Credit: Rijksmuseum, Amsterdam. |
| `clothed-pair.png` | AI-assisted repair of emblem XXX, created 2026-10-13 with OpenAI image generation from `emblem30.jpg`. | Contemporary derivative, not an untouched historical scan. Removed background, retained engraved sun/moon faces and hand poses, replaced nude bodies with fully opaque long robes and sleeves. Reviewed before extraction; original source remains alongside it. |

`clean-robes.png` is a second AI repair of the same clothed pair: the hands crossing the fronts of the robes were removed and robe folds restored. The original hands remain in separate animated limb layers. This avoids duplicate hands behind a moving arm. Only the torso masks use this repair.

`tools/prepare_alchemy.py` records the cut-out polygons and deterministic levels conversion. It writes a separate brown-black alpha ink image and silhouette mask for each piece. Code applies warm paper and irregular colour washes below that ink. `js/alchemy/pieces.js` contains the crop registration, so the established file-URL renderer needs no network or fetch calls.

The branching boughs, leaves, roots, miniature bird trumpets, ray fans and roundel motion are original code-drawn elements, not claimed to be extracted from historical scans. Their fine strokes and hatching are designed to sit with the source linework. Palette and animation are new, not historical colour evidence.

The unchanged song and Demucs stems are the existing pinned local project inputs documented in #119. No audio, transcript or finished video is included in the PR. The rendered preview is local only; do not contact the artist or upload without Robin's instruction.

## Rebuild

Place the five media files above in `source/alchemy/`, retaining the repaired PNG (the AI repair is not reproducible byte for byte from a prompt). With Pillow and NumPy installed:

```sh
python tools/prepare_alchemy.py source/alchemy
PAGE=alchemy.html node check.mjs --full out/alchemy-full 50 58.5 64 69.5 74.5 78.5
PAGE=alchemy.html node render.mjs 47 79.5 out/att_alchemy-v1_f01128-f01908_24fps_draft.mp4 4 24 0.6667
```

The audio analysis script uses NumPy, SciPy, SoundFile and Pillow. It saves a diagnostic spectrogram and onset candidates under `out/`. HPSS plus band limiting reduces drums and vocals but does not isolate trumpet from other harmonic instruments; the cue list therefore remains explicitly labelled as candidates pending an ear check.
