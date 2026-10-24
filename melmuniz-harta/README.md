# Mel Muñiz, "Harta"

Cut-paper music video with timed Spanish captions, made for Arowyn's Spanish class (issue #177). Song from
Mel Muñiz's 2020 album *Aguerrida*; audio from her official upload 8pf8kVVcKIQ (3:05), pinned by sha256 in
`source/` (gitignored). Look and kit forked from `bobwiseman-in-her-dream` (cut paper, draft 2).

- `js/captions.js`: the caption strip (one sung line at a time, the sung word in carmine), drawn crisp after the paper finish.
- `js/words.js` (gitignored, quotes the lyric): `tools/align_chunks.py` force-aligns `source/harta.lyrics.txt`
  to the Demucs vocal stem chunk by chunk (Spanish-aware `tools/align.py`), then `tools/onsets.py`, a hand fix
  and `tools/mkwords.py`.
- Storyboard and builder brief: `STORYBOARD.md` and `out/b/COMMON.md` (gitignored).
- Check: `PAGE=film.html node check.mjs out/x.jpg t1 t2 ...`; render: `PAGE=film.html node render.mjs 0 185 out/x.mp4 4 24 0.6667`.
