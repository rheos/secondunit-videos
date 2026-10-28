# Toolbox

One file per tool, `toolbox/<slug>.yaml`: every library, app, model, service and method we use or have weighed
for video, animation, image, audio and 3D work. It does for tools what `looks/` does for visual styles: one place
to find out what we already have before adding something new. `INDEX.md` lists them by status and by keyword.

**Check here before installing or building anything.** Search the keywords (`grep -ril physics toolbox/`) or read
`INDEX.md`. If a tool is already here, use it; if it was rejected, read the `why` first.

**Every tool you install, try or turn down gets a file in the same session,** candidates included: something we
read about and might want is exactly what gets forgotten. Then run the index and commit both.

```bash
uv run --no-project --with pyyaml python toolbox/index.py
```

The guard workflow runs it with `--check` on every PR, so a missing field or a stale `INDEX.md` fails the PR.

## Fields

| Field | What it is |
|---|---|
| `slug` | File name and id, lowercase with hyphens. |
| `name` | The tool's own name. |
| `kind` | `library`, `framework`, `app`, `cli`, `service`, `model`, `method`, `toolkit`, `tool` or `script`. |
| `status` | `in-use` (used in real pieces), `available` (installed or reachable, not used in a piece yet), `candidate` (not installed, worth a test), `rejected`, `retired`. |
| `does` | One plain sentence: what it does. |
| `keywords` | What someone would search for when they need it: the effect (`physics`, `confetti`, `vhs`), the job (`voiceover`, `captions`), the medium (`3d`, `shader`). Reuse words already in `INDEX.md` before inventing new ones. |
| `fits` | Where it would go in our work: projects, film types, specific shots. |
| `deterministic` | For anything that draws frames: `yes` (draws any frame from its time, so HyperFrames can seek it), `bake` (runs in real time; simulate once, record each frame, play back from time), or `n/a`. |
| `how` | How it runs on this Mac: path, CLI, MCP, Docker image, or "not installed". |
| `cost` | `free`, `plan` (a subscription Robin already pays), `plan credits`, or `paid` with a rate. |
| `url` | The project's home or repo. |
| `detail` | Where the how-to lives: a skill, a reference page, a memory. |
| `source` | Where we heard of it, with the date. |
| `verdict` | Robin's words on it, or a dated recommendation with who made it. |
| `why` | Required when `rejected`: the reason, so nobody re-evaluates it from scratch. |
| `related` | Slugs of tools that overlap or work together. The index check fails on a slug with no file. |
| `added` | The date the file was written. |

Unknown values are left out; don't guess. When a candidate gets installed, change its `status` and `how` in the same
commit. Detailed recipes (commands, presets, gotchas) stay in the video-production skill's references; the file's
`detail` points there.
