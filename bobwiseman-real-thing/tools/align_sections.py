# Align the working lyric per section window (held refrains have no words on the sheet, so a whole-song
# alignment stretches lines across them). Usage: align_sections.py <vocals> <lyrics> <out.json>
import json, subprocess, sys, os
V, L, OUT = sys.argv[1:4]
lines = [l.strip() for l in open(L).read().split("\n")[3:] if l.strip()]
SEC = [(24.5, 49.6, 0, 4), (49.0, 69.5, 4, 5), (80.8, 106.0, 5, 9), (105.6, 126.0, 9, 10), (128.8, 138.6, 10, 11), (140.5, 161.0, 11, 12)]
allw = []
for i, (t0, t1, a, b) in enumerate(SEC):
    f = f"work/_sec{i}.txt"; open(f, "w").write("x\nx\n\n" + "\n".join(lines[a:b]) + "\n")
    subprocess.run([sys.executable, os.path.dirname(__file__) + "/align.py", V, f, f"work/_sec{i}.json", str(t0), str(t1)], check=True)
    for w in json.load(open(f"work/_sec{i}.json"))["words"]: allw.append({**w, "line": w["line"] + a})
json.dump({"lines": lines, "words": allw}, open(OUT, "w"), indent=0)
