"""source/aligned.json (tools/align_lyrics.py) -> source/lines.json for finals.html: one caption per sung line, shown from
its first word to its last word plus a short hold (1.2 s, never into the next line). Local only: it quotes the lyric."""
import json
d = json.load(open('source/aligned.json'))
L = d['lines']; out = []
for i, l in enumerate(L):
    nxt = L[i + 1]['s'] if i + 1 < len(L) else 1e9
    out.append({'a': round(l['s'], 3), 'b': round(min(nxt - .12, l['e'] + 1.2), 3), 'text': l['text']})
json.dump({'source': 'Bob Wiseman lyric sheet, aligned to the vocal stem', 'sha256': d['sha256'], 'lines': out}, open('source/lines.json', 'w'), indent=1)
for x in out: print(f"{x['a']:7.2f}-{x['b']:7.2f}  {x['text']}")
