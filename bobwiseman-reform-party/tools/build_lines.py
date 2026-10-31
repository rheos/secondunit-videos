# Builds source/lines.json: every sung line in sung order (source/reform-party.sung.txt) with start/end and per-word onsets.
# Lines 0-34 from the global MMS alignment on the vocal stem (work/align-main.json); the four outro repeats from
# one window each (work/align-o<t0>.json), because the global pass smeared them. Outro lines are marked approx.
import json
main = json.load(open('work/align-main.json'))
outro = [json.load(open(f'work/align-o{k}.json')) for k in ('218', '227.6', '238.0', '246.6')]
lines = []
for li, text in enumerate(main['lines']):
    if li >= 35: ws = [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in outro[li - 35]['words']]; approx = True
    else: ws = [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in main['words'] if w['line'] == li]; approx = False
    lines.append({'i': li, 'text': text, 's': ws[0]['s'], 'e': ws[-1]['e'], 'words': ws, 'approx': approx})
for a, b in zip(lines, lines[1:]):
    if a['e'] > b['s']: a['e'] = a['words'][-1]['e'] = round(b['s'] - .02, 3)
    assert a['s'] < b['s'], (a['text'], b['text'])
json.dump({'song': 'reform-party', 'sha256': open('source/reform-party.wav.sha256').read().split()[0], 'fps': 24, 'lines': lines}, open('source/lines.json', 'w'), indent=1)
for l in lines: print(f"{l['s']:7.2f}-{l['e']:7.2f} {'~' if l['approx'] else ' '} {l['text']}")
