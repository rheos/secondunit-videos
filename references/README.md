# Reference profiles

A library of people whose ideas Robin wants to call on, visually or philosophically. Open
[index.html](index.html) for the illustrated library page. Each profile
turns one person's work into something an agent can use on a brief: what they did, what we infer
from it, and a short pass that asks "what would they add here?"

These are studies, not imitations. A profile borrows a way of thinking or a rendering method; a
video stays in its own look unless Robin asks for the profile's surface too.

## Profiles

| Profile | Calls on | Start with | Used in |
|---|---|---|---|
| [Mark Von Ulrich](mark-von-ulrich/) | Symbolic construction: give the idea a body (giant ear = listening, person built from their tools, one face compared across structures). Visually: early colour Mac raster, 256-colour system palette, ordered dither. | `AGENT-DIRECTION.txt` (symbolic pass); add `STYLE-BRIEF.txt` only for the raster look | Travel Agent draft 6 (`bobwiseman-travel-agent/MVU-DIRECTION.md`) |
| [Joel Nakamura](joel-nakamura/) | Inhabited story: give an object a life and a world inside it (an ark becomes a DNA lab, a saxophone becomes a stage, slow wifi becomes a snail). Visually: painted and ornamented folk panels with glyph-like figures. | `AGENT-DIRECTION.txt`; `articles.html` for the illustration beside its article; add `STYLE-BRIEF.txt` for the panel look | Not yet |
| [Terry Gilliam](terry-gilliam/) | Cut-out satire: cut a respectable thing out of its world, make it misbehave, turn it into the next thing (found face on a silly body, the link as the joke, the convenience that eats its user, the stop from above). Visually: Victorian photographs and airbrush on deep skies, dark-rimmed paper pieces, sudden paper motion. | `AGENT-DIRECTION.txt`; `PSYCHOLOGY.md` for why the symbols work; add `STYLE-BRIEF.txt` for the cut-out look | Not yet (the `bobwiseman-wgt-gilliam` look test came before it) |
| [Mark Achbar](mark-achbar/) | Documentary argument: measure the claim in public and show the machinery (column inches unrolled across a stadium, a diagnostic checklist with ticks that land as jokes, the idea played on a Jumbotron nobody watches, surgeons editing a newspaper). Sourced devices from *Manufacturing Consent* and *The Corporation*; no images (copyrighted). | `AGENT-DIRECTION.txt`; `devices.md` for the sourced catalogue | Romancing the Atom test reel (`achbar-atom-reel`, `STUDY-romancing-the-atom.md`) |
| [Kevin Ngo](kevin-ngo/) | Object as hero: one small thing with a body of its own (a paperclip that re-bends into every tool it needs, a paper boat on a journey home), a world built from things everyone owns, one locked look, one colour arc, an ending that rhymes with the opening. Visually: marker and ink on cream paper, clean vector, or toon-shaded Blender; every frame code, no generated images. | `AGENT-DIRECTION.txt`; `STUDY-paperclip-and-sticky-note.md` for the recipes (P01-P14); add `STYLE-BRIEF.txt` for the marker-on-paper look | Clean vector test (`indieagent-clean-vector-test`, PR #232), Travel Agent's manner and arm look (PR #239) |

## Calling on a profile

Give the agent the profile's `AGENT-DIRECTION.txt` plus the shot or section brief and ask for its
pass ("what would Mark add to 1:14-1:31?"). The direction file says what to return: the scene's claim,
two options, a recommendation, and what to keep. Add the style brief only when the profile's surface
is wanted. Record the outcome in the project (a `<INITIALS>-DIRECTION.md` there, like Travel Agent's),
and add the project to the "Used in" column above.

## Building a new profile

One folder per person: `references/<first-last>/`. Mark's folder is the worked example; copy its
shape. Terry Gilliam's shows the same shape for an artist whose work is copyrighted and cannot be
committed: cite and link the works, and commit only public-domain material. Only `README.md` and
`AGENT-DIRECTION.txt` are required. Add the profile to the table above and a card to `index.html`.

| File | What it holds |
|---|---|
| `README.md` | Who, what's in the folder, sources, and what is fact versus inference. |
| `AGENT-DIRECTION.txt` | The working tool, about one page: core principle, 5-7 moves, reference anchors by ID, how much to add, what to return, checks. |
| `STYLE-BRIEF.txt` | Optional. Rendering spec when the visual surface is wanted (palette, edges, motion rules, rejects, acceptance check). |
| `index.html` + `artwork-index.json` | Catalogue of works with stable IDs (U01, U02...), source links, observed symbols, cautious readings. |
| `director-guide.html` | Optional. Illustrated reasoning and worked concepts. |
| `biography.html` / `.json` | Optional. Sourced life facts, each tied to a source id. |
| `artwork/`, `previews/`, `pages/` | Images (committed). Large PDFs stay local under `sources/`, listed with URL and SHA-256 in `sources/download-manifest.json`. |
| `STUDY-<project>.md` | Optional. How the profile bears on one project. |
| `PSYCHOLOGY.md` | Optional. Why the symbols work on a viewer, symbol by symbol, each reading labelled with the framework it borrows. |

Rules that keep profiles useful and honest:

- Every claim about the person cites a source; anything we read into the work is labelled as inference.
  Never write in their voice or invent their intent.
- Anchor ideas to specific works by ID, so an agent can look at the picture.
- Separate the thinking (works in any medium) from the surface (palette, texture, technique).
- Private correspondence is summarised, not copied in.
- Credit the work to its maker; rights stay with them. The repo is private and the collection is for study.

The same shape works for a philosopher or writer: swap the artwork catalogue for a catalogue of
passages or ideas with IDs, keep the direction file.

## Profiles built in ChatGPT

Robin also builds profiles in ChatGPT under `~/Documents/ChatGPT/IndieAgent/references/`. Every one of
them belongs here too, so any agent working in `secondunit/` can find it. From the repo root:

    tools/sync-chatgpt-references.sh            # dry run: what would change
    tools/sync-chatgpt-references.sh --apply    # copy, then commit on a branch

It compares by content, never deletes, leaves PDFs and files over 25 MB local, and never overwrites an
existing profile's `README.md` (the repo copy says where it lives; merge those by hand).
