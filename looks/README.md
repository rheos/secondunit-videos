# Look catalogue

One file per look, `looks/<slug>.yaml`. This is the single record of every visual look the studio has built:
what it shows the world (the card on novadiem.com/video/styles) and how to make it again (the recipe).

**Check here before building a look.** Search the rules and notes (`grep -ril hatch looks/`) for anything close
to what you're about to make. If a look already exists, build on its code instead of starting over.

**Every new look gets a file in the same session that makes it,** with its clip on the styles page (see below).

## Fields

Public: these go to the styles page. Write them for a client to read.

| Field | What it is |
|---|---|
| `slug` | File name and id, lowercase with hyphens. Never renamed once published. |
| `title` | 2 to 5 words that describe the technique. Never the title of a film, painter, artist, show or product it echoes ("Rotoscope dream", not the film it recalls). |
| `note` | One or two plain sentences: what is on screen and what makes the look. No em dashes, no hype. |
| `used` | The piece it was made for, "Song, Artist", plus "test" when it was only a look test. |
| `cost` | `free` (every frame drawn or rendered by our code), `credits` (paid generation), `hybrid` (both), `live action`, or a number such as `34 credits`. |
| `group` | `code` (Drawn in code), `generated`, or `live` (Live action with matched AI). |
| `order` | Position inside its group on the page, in tens. |
| `clip` | The 6 s muted preview in rheos/novadiem.com `public/video/styles/`: 640x360, or 360x640 when `tall`. |
| `tall` | `true` for 9:16 clips. |

Recipe: internal. Never copied to the site.

| Field | What it is |
|---|---|
| `status` | `approved` (in a finished or signed-off piece), `draft` (in a piece still in review), `test` (look test only), `option` (kept for other films), `rejected`. |
| `engine` | `canvas2d`, `hyperframes`, `blender`, `brushstroke` (code frames repainted by the brushstroke renderer), `p5`, `generated`, `live action`, or a short combination. |
| `project` | Folder(s) under rheos/secondunit-videos (or the repo that holds it). |
| `code` | `path` to the file that draws it, `flag` if a page flag switches it on (e.g. `?look=arm`), `page` to open, `note` for anything else a builder needs. |
| `rules` | The look's rules as short lines: ink, fill, shading, texture, palette limit, motion, framing. Enough to rebuild it. |
| `palette` | Main colours as hex, when known. |
| `reference` | What it was made after (artist, film, print tradition). Internal only. |
| `proof` | Where to see it: render paths, PRs, YouTube ids. |
| `verdict` | Robin's or the client's words on it, with the date. |
| `related` | Slugs of close looks. |

Unknown values stay `null` or empty; don't guess.

## Adding a look

1. Write `looks/<slug>.yaml` with every field you can fill.
2. Cut the 6 s clip into rheos/novadiem.com `public/video/styles/<clip>`.
3. In rheos/novadiem.com: `npm run sync-looks` (pulls this folder from origin/main; `-- --from <path>` for a local
   checkout), then `npm run build`. The build fails if a look has no clip or a clip has no look.
4. Commit both repos through their PR flow, merge, `npm run deploy` in the site.
