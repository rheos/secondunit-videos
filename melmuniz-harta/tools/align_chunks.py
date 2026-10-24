# Align the sung-order lyric file chunk by chunk (each chunk = a span of song time + its lines), so the
# long held "Haaarta"s and the "Ah" vocalises can't drag words across chunks. Writes one merged json
# in align.py's format: {"lines": [...], "words": [{w, line, s, e, score}]}.
import json, subprocess, sys, tempfile, os
lyr, stem, out = sys.argv[1], sys.argv[2], sys.argv[3]
head = open(lyr).read().split("\n")[:3]
lines = [l.strip() for l in open(lyr).read().split("\n")[3:] if l.strip()]
CHUNKS = [(24.0, 47.5, 0, 4), (49.0, 60.0, 5, 5), (71.0, 88.5, 6, 9), (88.5, 102.5, 10, 10),
          (127.0, 140.5, 11, 12), (146.5, 152.5, 13, 13), (156.5, 164.8, 14, 14)]
py = sys.executable
allw = []
for t0, t1, a, b in CHUNKS:
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write("\n".join(head) + "\n" + "\n".join(lines[a:b + 1]) + "\n"); tmp = f.name
    o = tmp + ".json"
    subprocess.run([py, os.path.join(os.path.dirname(__file__), "align.py"), stem, tmp, o, str(t0), str(t1)], check=True)
    for w in json.load(open(o))["words"]:
        w["line"] += a; allw.append(w)
json.dump({"lines": lines, "words": allw}, open(out, "w"), ensure_ascii=False, indent=0)
for li, l in enumerate(lines):
    ws = [r for r in allw if r["line"] == li]
    print(f"{ws[0]['s']:7.2f}-{ws[-1]['e']:7.2f}  min {min(r['score'] for r in ws):.2f}  {l}")
