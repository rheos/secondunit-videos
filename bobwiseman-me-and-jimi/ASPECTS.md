# Aspect ratios in this project

The 16:9 video is the master. Every other ratio is ADDED beside it; nothing of the master is edited or replaced.

| What | 16:9 (master) | 9:16 |
|---|---|---|
| page | `wood.html` (+ `wood-1..6.html` per section) | `wood-9x16.html` (sets `window.PORTRAIT`) |
| shots, recomposed | `js/wch/` | `js/wch-9x16/` (0:00-0:59.5 so far) |
| pan-and-scan plan | n/a | `aspects/9x16/panscan-plan-v1.json` (run `node vertical.mjs wood <plan> <out>`) |
| renders | `out/` | `out/9x16/` |
| builder brief | `docs/WOODCUT_BUILD.md` | `docs/PORTRAIT_BUILD.md` |

Shared by every aspect, read-only for aspect work: `assets/`, `source/`, `_in/`, the kit (`js/wood.js`, `js/wkit.js`),
the look. `js/core.js` reads the canvas size from the page (W x H); the look shader uses W/H.
A new ratio = a new page `wood-<ratio>.html`, a new shot folder `js/wch-<ratio>/`, plans under `aspects/<ratio>/`,
renders under `out/<ratio>/`. Commit with explicit paths.
