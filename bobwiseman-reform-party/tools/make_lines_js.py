# source/lines.json -> js/gen/lines.js (gitignored: quotes the lyric)
import json, os
d = json.load(open('source/lines.json')); os.makedirs('js/gen', exist_ok=True)
open('js/gen/lines.js', 'w').write('const LINES = ' + json.dumps([{k: l[k] for k in ('i', 'text', 's', 'e', 'words')} for l in d['lines']]) + ';\n')
print(len(d['lines']), 'lines')
