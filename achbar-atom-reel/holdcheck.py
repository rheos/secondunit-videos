# Reading time: after a plate's last typed character or slammed letter, the picture must hold before the hand-over.
# Reads assets/cues.json (node cues.mjs) and the PLATE map from js/shots.js; flags any plate holding under MIN s.
#   python3 holdcheck.py        (Robin, 2026-10-19: "we can't have the slide blink away the next second after the last word")
import json, re, sys
src = open('js/shots.js').read(); B0 = float(re.search(r'const B0 = ([\d.]+)', src).group(1)); BEAT = float(re.search(r'BEAT = ([\d.]+)', src).group(1)); BAR = 4 * BEAT
bar = lambda n: B0 + n * BAR
pm = dict(re.findall(r'(\w+): bar\((\d+)\)', re.search(r'const PLATE = \{[^\n]*\}', src).group(0))); END = float(re.search(r'const END = ([\d.]+)', src).group(1))
starts = sorted([(bar(int(v)), k) for k, v in pm.items()] + [(0.0, 'A')]); starts = [(0.0, 'A')] + [x for x in starts if x[0] > 0]
cues = json.load(open('assets/cues.json')); MIN = 1.5; bad = 0
for i, (a, k) in enumerate(starts):
    b = starts[i + 1][0] if i + 1 < len(starts) else END
    cs = [c['t'] for c in cues if a <= c['t'] < b and c['k'] in ('type', 'slam')]
    if not cs: print(f'{k}  {a:6.1f}-{b:6.1f}   no typed text'); continue
    hold = b - max(cs); flag = '  <-- SHORT' if hold < MIN else ''; bad += hold < MIN
    print(f'{k}  {a:6.1f}-{b:6.1f}   last text {max(cs):6.1f}   hold {hold:5.2f} s{flag}')
print('plates holding under %.1f s: %d' % (MIN, bad)); sys.exit(1 if bad else 0)
