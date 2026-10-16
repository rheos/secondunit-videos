"""python3 fontcheck.py <project dir> <page>
Warn about fonts that will not match on the cloud-render runner. For each family list the page uses (CSS
font-family, canvas font strings), the face Mac Chrome draws is the first family this Mac has; if the runner
cannot draw that same family, fontconfig there swaps in another face without a word and the frames stop
matching Mac frames. Follows the page's local scripts, styles and module imports. Always exits 0.
"""
import os, re, subprocess, sys

# the runner's families: the Microsoft core fonts the workflow installs, which Apple ships too
RUNNER = {'andale mono', 'arial', 'arial black', 'comic sans ms', 'courier new', 'georgia', 'impact',
          'times new roman', 'trebuchet ms', 'verdana', 'webdings'}
GENERIC = ('sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif',
           'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong')
GEN = '|'.join(re.escape(g) for g in sorted(GENERIC, key=len, reverse=True))
NAME = r'''(?:"[^"\n]{1,40}"|'[^'\n]{1,40}'|[A-Za-z][\w -]{0,38}?)'''
LIST_RE = re.compile(rf'((?:{NAME}\s*,\s*)+)(?:{GEN})(?![\w-])')  # a family list ending in a generic family
DECL_RE = re.compile(r'font-family\s*:\s*([^;}{\n]+)', re.I)
FACE_RE = re.compile(r'@font-face\s*{[^}]*?font-family\s*:\s*["\']?([^;"\'}]+)', re.I)
JSFACE_RE = re.compile(r'new\s+FontFace\(\s*[`"\']([^`"\']+)')
GFONT_RE = re.compile(r'fonts\.googleapis\.com/css2?\?([^"\'\s>]+)')
REF_RE = re.compile(r'''(?:src|href)\s*=\s*["']([^"'#?]+)|(?:from|import\s*\()\s*["']([^"'#?]+)|@import\s+(?:url\()?["']?([^"')\s;]+)''')

def clean(n):
    n = n.strip().strip('"\'').strip()
    # canvas strings and the CSS shorthand put size and weight before the first family: "bold 40px Courier New"
    n = re.sub(r'^.*(?:\d|\})(?:px|pt|em|rem|%)(?:\s*/\s*[\d.]+\w*)?\s+', '', n)
    n = n.strip().strip('"\'').strip()
    return '' if re.search(r'[${}()]|^var\b|^\d', n) else n

def crawl(root, page):
    seen, todo, texts = set(), [os.path.normpath(os.path.join(root, page))], []
    while todo:
        f = todo.pop()
        if f in seen or not os.path.isfile(f) or not f.startswith(root):
            continue
        seen.add(f)
        t = open(f, encoding='utf-8', errors='replace').read()
        texts.append(t)
        for m in REF_RE.finditer(t):
            r = next(g for g in m.groups() if g)
            if '://' not in r and not r.startswith('data:') and re.search(r'\.(m?js|css|html)$', r):
                todo.append(os.path.normpath(os.path.join(os.path.dirname(f), r)))
    return texts

def mac_families():
    try:
        out = subprocess.run(['fc-list', ':', 'family'], capture_output=True, text=True, timeout=60).stdout
    except (OSError, subprocess.SubprocessError):
        return None   # no fontconfig here: assume this Mac has every family a page names
    return {f.strip().lower() for line in out.splitlines() for f in line.split(',') if f.strip()}

def main():
    root, page = os.path.abspath(sys.argv[1]), sys.argv[2]
    lists, provided = [], set()
    for t in crawl(root, page):
        for m in list(LIST_RE.finditer(t)) + list(DECL_RE.finditer(t)):
            lists.append([n for n in map(clean, m.group(1).split(',')) if n])
        provided.update(m.group(1).strip().lower() for m in FACE_RE.finditer(t))
        provided.update(m.group(1).strip().lower() for m in JSFACE_RE.finditer(t))
        for m in GFONT_RE.finditer(t):
            provided.update(f.split(':')[0].replace('+', ' ').lower() for f in re.findall(r'family=([^&]+)', m.group(1)))
    mac, missing = mac_families(), set()
    for fams in lists:
        for n in fams:
            k = n.lower()
            if k in RUNNER or k in provided or k in GENERIC:
                break   # both machines draw this one (a generic family differs, but nothing names a face)
            if mac is None or k in mac:
                missing.add(n)   # Mac Chrome draws this face; the runner falls through to another
                break
    if missing:
        print('WARNING: Mac Chrome draws ' + ', '.join(sorted(missing)) + ' for this page and the runner has no such font,')
        print('  so cloud frames will show a fallback face and will not match Mac frames. Load the font in the')
        print('  page (@font-face or Google Fonts) or render this page on the Mac.')

main()
