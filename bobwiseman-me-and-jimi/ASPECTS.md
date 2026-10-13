# Aspect ratios in this project

The 16:9 video is the master. Every other ratio is ADDED beside it; nothing of the master is edited or replaced.

| What | 16:9 (master) | 9:16 |
|---|---|---|
| page | `wood.html` (+ `wood-1..6.html` per section) | `wood-9x16.html` (sets `window.PORTRAIT`) |
| shots, recomposed | `js/wch/` | `js/wch-9x16/` (whole song: p1, p2, p2b, p3, p4, p5, p6a, p6b) |
| pan-and-scan plans | n/a | `aspects/9x16/panscan-plan-*.json` (run `node vertical.mjs wood <plan> <out>`) |
| master = redraw + picked pan shots | `out/maj_woodcut-v12_...master1080.mp4` | `aspects/9x16/master-picks.json` -> `out/9x16/maj_master9x16-v3_...` |
| renders | `out/` | `out/9x16/` |
| builder brief | `docs/WOODCUT_BUILD.md` | `docs/PORTRAIT_BUILD.md` |
| with on-screen lyrics (docs/LYRICS.md) | `wood-cap.html` -> `out/maj_woodcut-v13-lyrics_...master1080.mp4` | `wood-9x16-cap.html` -> `out/9x16/verses/` (the three verse clips) |

Shared by every aspect, read-only for aspect work: `assets/`, `source/`, `_in/`, the kit (`js/wood.js`, `js/wkit.js`),
the look. `js/core.js` reads the canvas size from the page (W x H); the look shader uses W/H.
A new ratio = a new page `wood-<ratio>.html`, a new shot folder `js/wch-<ratio>/`, plans under `aspects/<ratio>/`,
renders under `out/<ratio>/`. Commit with explicit paths.
