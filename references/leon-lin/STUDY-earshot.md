# earshot (Leonxlnx/earshot): what is worth taking

Tested 2026-10-24 on version 0.4.0 (MIT, Leon Lin). Issue #298.

## Recommendation

Borrow, don't adopt. Keep two parts:

- **`timeline --cues` as a sync check** on drafts where the picture follows sound we placed by hand
  (painted hits, beat-sync grids, lip-sync). On Reform Party draft 33 it confirmed the teeth and
  pointed at five clacks worth a listen, in 90 s.
- **The sound bank (`sfx render`)** for code-drawn films: 252 effects written as code, rendered in
  seconds with no models. It is the quickest way to put sound on animation events (Robin's ask from
  the Achbar reel), and it beats hand-picking files.

Drop `critique`, `find` on full mixes, and the MCP server for now. `critique` scores everything
against seven software launch films and gives advice that is wrong for an artist's song. `find`
can't pick a backing voice out of a dense mix.

## Install on this Mac

earshot needs PyTorch 2.6 or newer. PyTorch stopped shipping Intel-Mac builds after 2.2.2, so a native
pip install fails here. It runs in Docker instead:

```Dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY . /earshot
RUN pip install --no-cache-dir -e "/earshot[mcp]"
ENV EARSHOT_HOME=/cache EARSHOT_THREADS=4
WORKDIR /work
ENTRYPOINT ["earshot"]
```

Build from the earshot clone: `docker build -f <this Dockerfile> -t earshot:0.4.0 .` Then
`docker run --rm -v <cache>:/cache earshot:0.4.0 doctor --fetch` once, and every later call with
`-e EARSHOT_OFFLINE=1 -v <cache>:/cache -v <workdir>:/work`.

| | |
|---|---|
| Image | 3.1 GB, 11.6 min to build on home internet |
| Models | CLAP + AudioSet tagger, 1.1 GB, 3.5 min to fetch |
| `timeline` on 15 s | 93 s per call (model load is most of it) |
| `measure`, `sfx render` | about 5 to 40 s, no models |

Each CLI call reloads the models. For more than a few calls, use one Python script with
`from earshot import api` inside the container.

## Test 1: sync of painted hits (Reform Party draft 33, run 1)

Input: the song from 0:35 to 0:50 and the 62 teeth clack times Robin painted in tools/beat-sync
(`js/dali/buh-onsets.js`), as cues.

What it said:
- 66% of clacks have an onset within 40 ms (41% would by chance), 84% within 100 ms, median offset
  31 ms with the sound slightly ahead of the clack. That is within one frame: the grid is right.
- Two clacks at the head of run 1 (0:37.31 and 0:37.62) answer a level peak about 140 ms earlier,
  not an onset. Either the first buhs are soft or the run starts a hair late.
- Three clacks have no hit under them: 0:41.52, 0:42.72, 0:45.12. All three are in the stretch where
  Robin moved four cells for draft 33. These are the ones to listen to first.
- It tagged the section "funk music, vocal chop" and the buhs mostly as snare hits, plucks or
  "cork pop": the tags are hints, not a transcript. Beat grid about 100 BPM (the song is 99.4).

Verdict: useful as a cheap second opinion on any hand-placed timing, and it says where to listen.
It doesn't replace Robin's ear: it can't tell a buh from a hi-hat on the same 16th.

## Test 2: find the backing voice (`find`)

Query "a short repeated buh buh buh vocal syllable, a backing voice" on the same 15 s. Of 12 "strong"
results, three fall before run 1 starts (0:35.0 to 0:36.3), and the rest score about the same
(z 3.6 to 4.9) whether or not they sit on Robin's taps. On a full mix it finds sounds, not the voice.
Try it again on a Demucs vocal stem before ruling it out for listening passes.

## Test 3: critique (draft 33 teeth patch, 13 s)

"Close, 3 major issues": turn the master down 3.4 dB, let a loud moment rise, add a true-peak limiter,
add a stop-down before the biggest change. All four are about mastering a launch film, and the master
is Bob's: we never touch it. It read the tempo as 133 BPM and couldn't audit picture sync (fewer than
three visual cuts). Not for music videos.

## Test 4: the sound bank on a code-drawn clip

Two sounds under the opening of the call-toon test (look `call-toon`): `notify/mid_tine` as
"IndieAgent joined" appears and `ui_pop/soft` as his tile arrives, each one frame after its event.
Both rendered in about 5 s, peak and pitch settable, with a measured onset and peak in the output.
The bank's 34 families (clicks, taps, toggles, pops, dings, whooshes, risers, impacts) map well onto
the cue kinds our `cues.mjs` already collects.

## If we adopt the bank

- Keep the Docker image (no models are needed for `sfx`, so a slimmer image without torch would do if
  the import allows it; untested).
- Have the sfx script read `assets/cues.json` and call `sfx render <id> --dur --pitch --peak` per cue
  kind, one take per kind, then place them one frame after each event as now.
- Credit: MIT, keep Leon Lin's notice with any copied recipe.
