# Blender AI skills for lyric-led music videos: survey, 2026-10-16

The question: is an orb visualizer the best Blender can do for the kind of music videos we make,
where the visuals interpret the lyrics? This survey looks for agent skills on GitHub that help.
Star counts and push dates were read from the GitHub API on the day. Nothing listed here is
installed yet.

## Worth using

| Repo | Stars | Last push | License | Why |
|---|---|---|---|---|
| [EGSECDA/vocaloid-style-mv-pipeline](https://github.com/EGSECDA/vocaloid-style-mv-pipeline) | 145 | 2026-10-04 | MIT | Closest match: a Claude Code skill for lyric MVs (see below) |
| [scenario-labs/skills](https://github.com/scenario-labs/skills), `skills/dcc/blender/*` | 1030 | 2026-10-16 | MIT | Standalone Blender skills (see below) |
| [Evolink-AI/Awesome-Blender-Seedance-Workflow-Usecases](https://github.com/Evolink-AI/Awesome-Blender-Seedance-Workflow-Usecases) | 344 | 2026-07-20 | none stated | Blender as previs for Seedance (see below) |
| [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) (now `mcp-for-blender`) | 31k | 2026-10-06 | MIT | Live control of an open Blender |
| [sunxiayi/make-blender-education-video-skill](https://github.com/sunxiayi/make-blender-education-video-skill) | 55 | 2026-07-25 | MIT | A gated production workflow to borrow |

**EGSECDA/vocaloid-style-mv-pipeline**
- Its `references/02-creative-direction.md` covers lyrics → thesis → color script → motifs →
  a lyric-to-image table → signature moments.
- Its `07-blender-3d.md` is a toon-3D recipe for Blender 5.1.
- It treats a frame as a pure function of song time.

**scenario-labs/skills** (`skills/dcc/blender/*`)
- Skills: blender-expert, blender-animation, blender-grease-pencil, blender-geometry-nodes, plus
  scripts (`bx_*.py`).
- They don't need a Scenario account. Tested on Blender 5.2.1.
- The repo's music-video and kinetic-type skills do need Scenario credits.

**Evolink-AI/Awesome-Blender-Seedance-Workflow-Usecases**
- Blender blocks out the camera, staging and timing, then Seedance renders the style.
- This fits our Higgsfield (Seedance 2.5) pipeline.
- It has no music-sync cases.

**ahujasid/blender-mcp**
- Good for an interactive session in the GUI.
- Less suited to reproducible headless renders.

**sunxiayi/make-blender-education-video-skill**
- Its gates are worth copying: confirm the brief, keep a fact (claim) ledger, approve one 4K
  frame before any full render, then do frame-exact assembly and QA.

## Looked at, lower fit

- **RobLe3/cc-blender-skill** (98★): mostly reference-to-3D modeling. It does have an
  animation-quality-gate skill.
- **arjun988/blender-skills** (315★, last push July): 94 skills aimed at game assets.
- **TerminalSkills/skills** (168★): generic Blender skills, with `blender-grease-pencil` and
  `blender-vse-pipeline` among them.
- **TMHSDigital/Blender-Developer-Tools** (17★): bpy correctness for 5.1, with a 4.5 fallback.
- **hraness/slopcamera** (7★).
- **zhuyansen/awesome-claude-video-skills** (666★): an index of agent video tools.
  ledbetterljoshua/functional-emotions-video, our painted-video renderer, is listed there too.

## What Blender is actually good for in a lyric video (from the vocaloid reference)

1. Camera travel through a place, with real parallax: flythroughs, crane-ups, orbits.
2. Big 3D kinetic typography: lyric words as extruded monoliths the camera flies past or through.
3. Light as story: a sun that sets and sweeps shadows, lamps switching on as night falls.
4. Beat-locked mechanical motion: things that land on downbeats, instanced swarms.

Keep characters, faces and most lyric type in 2D. Put the 3D shots where the vocal rests, such as
interludes and post-chorus hits.

## Fixes for our orb script that the vocaloid reference points to

- **Crisp cel shadows** need the sun's `angle = 0` exactly. Ours is 3 degrees, which dithers the
  band edges.
- **Light calibration:** sun strength pi gives Shader-to-RGB 1.0. Keep lamps white and put the
  color in the ramps, because a colored sun shifts the band thresholds.
- **World sky through Is Camera Ray:** the camera sees the gradient, and the lighting sees a flat
  ambient.
- **Grease Pencil Line Art** gives inked outlines without the inverted-hull geometry.

## Blocker: this Mac can't run Blender 5

The vocaloid and scenario Blender material targets 5.1 and 5.2, and so do the blender-* skills
installed in ~/.claude/skills. This Mac is a 2019 Intel i9 MacBook Pro (x86_64). Blender 5.0 and
later ship for Apple silicon only on macOS ([devtalk announcement](https://devtalk.blender.org/t/deprecation-and-removal-of-macos-intel-builds-in-blender-5-0/38835)).
4.5 LTS is the last Intel build and is supported for two years from its July 2025 release.
Homebrew's `blender` cask installed 4.5.14 on 2026-10-12 for the ElfQuest project.

Options:

- **Stay on 4.5 locally and port.** The toon recipe, Grease Pencil v3 (4.3+), Line Art,
  Geometry Nodes and slotted actions are all in 4.5. Read the 5.x skills as method, and run
  `tools/probe_api.py` before trusting any API call they use.
- **Run 5.x in the cloud.**
  - A GitHub Actions macOS arm64 runner, the same pattern as secondunit-videos' cloud-render.
  - Linux with Mesa software GL. EEVEE is slow there, Cycles CPU is fine.
- **Compiling 5.x for Intel** is possible but means building all the dependencies too. Not worth it.
