# Builds source/lines.json: every sung line (Bob's words, outro repeats included) with start/end and per-word onsets.
# Sources, in priority order: windowed MMS alignments (w1, w2, tail), the bounded main alignment, then hand anchors
# from Whisper-on-stem where the aligner failed (marked "approx": check by ear).
import json
sung = [l.strip() for l in open('source/libelous.sung.txt').read().split('\n')[3:] if l.strip()]
def load(p):
    d = json.load(open(p)); out = {}
    for w in d['words']: out.setdefault(d['lines'][w['line']], []).append(w)
    return out
main, w1, w2, tail = (load(f'work/align-{k}.json') for k in ('main', 'w1', 'w2', 'tail'))
def spread(line, s, e):
    ws = line.split(); n = sum(len(w) + 1 for w in ws); t = s; out = []
    for w in ws:
        d = (e - s) * (len(w) + 1) / n; out.append({'w': w, 's': round(t, 3), 'e': round(t + d * .85, 3)}); t += d
    return out
anchors = {  # line -> (start, end) from Whisper word times on the vocal stem
    'And they gave them no jury and no legal aid': (264.98, 268.2),
    'The king had only 30 billions dollars to spend': (268.46, 271.9),
}
outro = [(296.4, 298.9), (298.98, 302.7), (302.8, 306.4), (306.52, 311.6), (311.86, 316.72), (317.06, 320.3), (320.52, 323.9), (325.5, 329.56)]
lines, seen, oi = [], {}, 0
first_outro = sung.index('But I\'ll fine you guilty of making a fuss')
for i, l in enumerate(sung):
    approx = False
    if i >= first_outro:
        s, e = outro[oi]; oi += 1; ws = spread(l, s, e); approx = True
    elif l in anchors:
        ws = spread(l, *anchors[l]); approx = True
    else:
        src = w1 if l in w1 else w2 if l in w2 else tail if l in tail else main
        k = seen.get(l, 0); seen[l] = k + 1
        ws = [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in src[l]]
    lines.append({'i': i, 'text': l, 's': ws[0]['s'], 'e': ws[-1]['e'], 'words': ws, 'approx': approx})
lines[0]['words'][0].update(s=13.9, e=14.4); lines[0]['s'] = 13.9
for a, b in zip(lines, lines[1:]):
    if a['e'] > b['s']: a['e'] = a['words'][-1]['e'] = round(b['s'] - .02, 3)
    assert a['s'] < b['s'], (a['text'], b['text'])
json.dump({'song': 'libelous', 'sha256': open('source/libelous.wav.sha256').read().split()[0], 'fps': 24, 'lines': lines}, open('source/lines.json', 'w'), indent=1)
for l in lines: print(f"{l['s']:7.2f}-{l['e']:7.2f} {'~' if l['approx'] else ' '} {l['text']}")
