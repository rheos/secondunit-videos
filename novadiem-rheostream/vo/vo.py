#!/usr/bin/env python3
"""Record the narration one plate at a time (ElevenLabs v4, George), passing the neighbouring lines as
previous_text / next_text so the read stays continuous. Writes vo/seg-NN.mp3 and vo/segments.json.
Every claim maps to ~/Code/novadiem/assistant/ideas/rheostream-video.md ("What's true", rheos/rheostream
docs/guide at 63f3658). The names are spelled for George: "Ree-oh" (rheo, as in rheostat), "Recall-a-tron"."""
import json, pathlib, urllib.request, subprocess, hashlib, sys
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George, the Recallatron film's narrator (Robin, 2026-10-21: "George again")
SEGS = [
 ("I", "[calm, warm] Working alone means living in a pile of tools. One finds the work, one tracks it, one remembers, and a few agent routines are stitched between them. Each is useful. Together, they trap your history: the lead knows nothing of the project it became."),
 ("II", "Ree-oh Stream rebuilds those parts as one system you own. Each workspace is its own database, so one can never read another's rows. Four modules sit on a small core, and agents come in through one door. Follow one inquiry through it."),
 ("III", "Your website signs the inquiry and sends it in. Ree-oh Stream checks the signature before it writes a thing, stores a receipt, the payload and an event in one commit, and only then says yes. Send it twice, and it is still one lead."),
 ("IV", "The save and its announcement are a single commit. A worker leases the job. If the process dies halfway, the lease runs out and the work runs again: safely, never twice. No broker, no workflow engine. Ordinary tables carry everything."),
 ("V", "Who sent it? Ree-oh Stream links a person only on evidence a connection proved. A matching name is a question for you, not an answer, because a wrong match shows one person's history to another. And every merge can be undone."),
 ("VI", "Ask Ree-oh what came in today: from Claude, from Telegram, or out loud. Every surface comes through one door, with a key for one workspace and a short list of operations. Ree-oh reads the lead and drafts a reply. The draft is a record. Nothing leaves."),
 ("VII", "Ree-oh proposes turning the lead into work, and the step stops at a gate. You approve this exact call, and only you can: no key of any kind can approve. When it runs, it checks again, so a permission withdrawn yesterday still holds today."),
 ("VIII", "Now it is work, in Current. An alert that fires three times becomes one item that wakes, reopens, or climbs in priority, and what you wrote about it stays as you wrote it."),
 ("IX", "The Recall-a-tron remembers why you took it on. The memory knows who may read it, and for what, and where it came from. Erase the lead, and the memory goes with it."),
 ("X", "Every change along the way left an audit record. Export the workspace, and all of it travels as one file, with the same identifiers, and arrives anywhere waiting for you, firing nothing. [gently] Your working life, in one current. Ree-oh Stream."),
]
ONLY = set(sys.argv[1:])  # plate keys to re-record; the rest keep their files
old = {x["plate"]: x for x in json.loads((HERE / "segments.json").read_text())} if ONLY and (HERE / "segments.json").exists() else {}
out = []
for i, (k, text) in enumerate(SEGS):
    if ONLY and k not in ONLY:
        out.append(old[k]); continue
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5, "speed": 1.1},
            "previous_text": SEGS[i - 1][1] if i else None, "next_text": SEGS[i + 1][1] if i + 1 < len(SEGS) else None}
    body = {a: b for a, b in body.items() if b is not None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    f = HERE / f"seg-{i:02d}.mp3"
    data = urllib.request.urlopen(req, timeout=300).read(); f.write_bytes(data)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
    out.append({"plate": k, "file": f.name, "seconds": round(dur, 3), "chars": len(text), "sha256": hashlib.sha256(data).hexdigest()})
    print(k, round(dur, 2), "s")
(HERE / "segments.json").write_text(json.dumps(out, indent=1) + "\n")
print("total chars", sum(s["chars"] for s in out), "speech", round(sum(s["seconds"] for s in out), 1), "s")
