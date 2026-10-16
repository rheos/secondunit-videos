# Terry Gilliam reference profile

Built 2026-10-15 (issue #154). A study of Gilliam's cut-out animation, 1968-1983: the method, the
symbols, and the psychology of why they work. His live-action films come in only as context.

## Start here

- `AGENT-DIRECTION.txt`: the one-page "What would Terry add?" pass. Give it to an agent with a
  section brief. It returns the scene's stiff thing, two options, a recommendation and how the
  section ends. Its "In a music video" section maps the moves onto a song: hits on the beat, cycles
  in bars, a dropping jaw for singing, verse chains and returning choruses, pans for instrumentals.
- `PSYCHOLOGY.md`: the deep file Robin asked for. Why the moves work on a viewer, symbol by symbol:
  the foot, the opening head, devouring machines, the betraying body, lies about scale, God as a
  found photograph, the animator who dies, flight and the fall, the margins of sacred books, high art
  as raw material. Every paragraph is labelled as Gilliam's own account, a secondary source, an
  outside framework, or our inference.
- `STYLE-BRIEF.txt`: the cut-out surface and motion, from his 1974 BBC lesson. Only when Robin wants
  the look as well as the thinking.
- `director-guide.html`: six moves with public-domain plates, what our We Got Time test taught us,
  and proposals for Bob's songs.
- `index.html` and `artwork-index.json`: the catalogue. G01-G30 are Gilliam's pieces, S01-S08 the
  public-domain source plates.
- `biography.html` and `biography.json`: sourced life facts, each tied to a source id.
- `sources.json`: every source id used anywhere in the profile. `research-notes.txt`: what we read,
  what failed, and what is still open.

## Rights: why there are no Gilliam images here

Gilliam's animation is copyrighted (Python (Monty) Pictures, the BBC and others). The catalogue cites
and links each piece and holds no frames, stills or clips. Links to official uploads are preferred;
third-party uploads are marked as such and may disappear.

The plates in `plates/` are public-domain paintings, prints and photographs of the kind he is
documented cutting from: Bronzino's allegory (the foot), the W. G. Grace photograph (Holy Grail's
God), Botticelli, Bosch, Bruegel, a medieval marginal drollery and a Victorian Christmas card. They
came from Wikimedia Commons; page URLs, sizes and SHA-256 are in `sources/plates-manifest.json`.
`previews/` holds 900 px copies for the pages. The plates are free to cut in our films, with two
exceptions noted in the catalogue: we do not use the Bronzino foot itself (it is the Python
emblem) or Grace's face (a real person).

## Fact and inference

Gilliam talks about method far more than meaning, and usually plays meaning down. So most of the
psychology is our reading through Bakhtin, Bergson, Freud and the study of medieval marginalia. Those
writers are not about him. Treat their fit as an argument, useful for directing, not as a claim
about what he thought.

Many Flying Circus pieces are known to us by title only (from Wikipedia's episode list). Their
catalogue entries say so. Watch a piece before using it as a visual anchor.

## Editing

Edit `artwork-index.json`, `biography.json` or `sources.json`, then rebuild the two generated pages:

    python3 references/terry-gilliam/build-pages.py

`director-guide.html` is written by hand. IDs are stable: add new pieces as G31 onward and new
plates as S09 onward, never renumber.

## Used in

Nothing yet. The earlier look test `bobwiseman-wgt-gilliam` (We Got Time chapter 8, 2026-10-04)
came before this profile; the director guide says what it got right and what differs from
Gilliam's method. When a project uses the profile, record it as `TG-DIRECTION.md` in that project
and add it to the table in `references/README.md`.
