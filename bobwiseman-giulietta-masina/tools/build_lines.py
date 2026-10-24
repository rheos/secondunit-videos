# Writes source/lines.json (the timed lyric contract; local only, it quotes the lyric) from
# source/giulietta-masina.timed.txt (one caption line per row: '[it] b=<hide> | word@onset word@onset ...').
# Why a hand-timed table: MMS_FA forced alignment (tools/align_lyrics.py -> source/lines-mmsfa.json) slid on this
# legato vocal stem, so each onset was picked from the stem's onsets and sibilance and cross-checked with
# faster-whisper large-v3 (see docs/LYRICS.md). Run: python3 tools/build_lines.py
import json, hashlib
lines = []
for raw in open('source/giulietta-masina.timed.txt').read().split('\n'):
    l = raw.strip()
    if not l or l.startswith('#'): continue
    head, words = l.split('|')
    flags = head.split(); it = 'it' in flags; b = float([f for f in flags if f.startswith('b=')][0][2:])
    ws = [{'w': x.rsplit('@', 1)[0], 's': float(x.rsplit('@', 1)[1])} for x in words.split()]
    lines.append({'i': len(lines), 'text': ' '.join(w['w'] for w in ws), 'it': it, 'a': round(ws[0]['s'] - .25, 3), 'b': b, 's': ws[0]['s'], 'words': ws})
sha = hashlib.sha256(open('source/giulietta-masina.wav', 'rb').read()).hexdigest()
json.dump({'song': 'giulietta-masina', 'sha256': sha, 'fps': 24, 'lines': lines}, open('source/lines.json', 'w'), indent=1)
print(len(lines), 'lines,', sum(len(l['words']) for l in lines), 'words')
