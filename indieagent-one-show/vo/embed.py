#!/usr/bin/env python3
"""Copy the plate timeline and the voice's word times into index.html (the lines starting
`const T =`, `const VO =`, `const END =` and `const WORDS =`), so the page needs no fetch."""
import json, pathlib, re
HERE = pathlib.Path(__file__).parent
page = HERE.parent / "index.html"
tl = json.loads((HERE / "timeline.json").read_text())
words = json.loads((HERE / "words.json").read_text())
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
compact = {k: [[norm(w), a] for w, a, b in v] for k, v in words.items()}
lines = {
    "const T =": "const T = " + json.dumps(tl["T"]) + ";",
    "const VO =": "const VO = " + json.dumps(tl["VO"]) + "; // where each plate's voice line starts inside it",
    "const END =": "const END = " + json.dumps(tl["END"]) + ";",
    "const WORDS =": "const WORDS = " + json.dumps(compact, separators=(",", ":")) + "; // vo/words.json, seconds from each line's start",
}
src = page.read_text().split("\n")
for i, line in enumerate(src):
    for key, new in lines.items():
        if line.strip().startswith(key):
            src[i] = line[: len(line) - len(line.lstrip())] + new
page.write_text("\n".join(src))
print("embedded", ", ".join(lines))
