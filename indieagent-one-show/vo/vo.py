#!/usr/bin/env python3
"""Record the voiceover one plate at a time (ElevenLabs v4, Jenna), passing the neighbouring lines as
previous_text / next_text so the read stays continuous. Writes vo/seg-NN.mp3 and vo/segments.json."""
import json, pathlib, urllib.request, subprocess
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICE = "TgnhEILA8UwUqIMi20rp"  # Jenna - Warm, Relatable and Articulate (picked by Robin 2026-10-15)
SEGS = [
 ("I", "You booked the show. Now you type it into your website. The poster. The event page. The email to the venue. Your spreadsheet. Five copies. And four of them are wrong."),
 ("II", "With Indie Agent, you say it once, the way you'd say it, in your own ChatGPT. \"Add Nelson, November twelfth, at the Royal.\" It works out the rest."),
 ("III", "It's your tour. You choose who else can change it: your manager, your drummer. Nobody else gets in."),
 ("IV", "Every show becomes one ticket, written down once."),
 ("V", "Your website's tour page, your listings and your promos all read from that ticket. Move a date, and everything follows."),
 ("VI", "Now the part that saves you the most time. Pick a run of dates. Say, the B.C. leg: eight shows, Kamloops to Nelson. Pick a look. Risograph, woodcut, big type, whatever fits the record. Press generate. Indie Agent makes the promo for that leg, with your dates, your towns and your venues, in your look. No editing app. No retyping."),
 ("VII", "And it comes out in every shape you post. Tall for Reels, TikTok and Shorts. Four by five for the Instagram and Facebook feed. Square. Widescreen for YouTube."),
 ("C", "Indie Agent. Your tour, kept straight. Coming soon."),
]
out = []
for i, (k, text) in enumerate(SEGS):
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5},
            "previous_text": SEGS[i - 1][1] if i else None, "next_text": SEGS[i + 1][1] if i + 1 < len(SEGS) else None}
    body = {a: b for a, b in body.items() if b is not None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    f = HERE / f"seg-{i:02d}.mp3"
    f.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
    out.append({"plate": k, "file": f.name, "seconds": round(dur, 3), "chars": len(text)})
    print(k, round(dur, 2), "s")
(HERE / "segments.json").write_text(json.dumps(out, indent=1) + "\n")
print("total chars", sum(s["chars"] for s in out), "speech", round(sum(s["seconds"] for s in out), 1), "s")
