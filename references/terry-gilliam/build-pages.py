"""Build index.html and biography.html from artwork-index.json, biography.json and sources.json.

Run from anywhere: python3 references/terry-gilliam/build-pages.py
Edit the JSON, not the HTML. director-guide.html is written by hand.
"""
import html
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
load = lambda name: json.load(open(os.path.join(HERE, name)))
art, bio, src = load("artwork-index.json"), load("biography.json"), load("sources.json")
e = html.escape

NAV = ('<nav aria-label="Collection"><a href="index.html">Catalogue</a><a href="biography.html">Biography</a>'
       '<a href="director-guide.html">Director\'s guide</a><a href="PSYCHOLOGY.md">Psychology of the symbols</a>'
       '<a href="AGENT-DIRECTION.txt">Quick agent brief</a><a href="STYLE-BRIEF.txt">Cut-out brief</a>'
       '<a href="../index.html">All profiles</a></nav>')


def page(title, lead, body):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Terry Gilliam: {e(title)}</title><link rel="stylesheet" href="styles.css"></head><body><main>'
            f'<header><div class="meta">Terry Gilliam reference profile · {e(art["updated"])}</div>'
            f'<h1>Terry Gilliam<br>{e(title)}</h1><p class="lead">{e(lead)}</p>{NAV}</header>{body}'
            '</main></body></html>\n')


def cite(ids):
    out = []
    for i in ids:
        s = src[i]
        out.append(f'<a href="{e(s["url"])}">{e(s["title"])}</a>')
    return '<span class="small">' + '; '.join(out) + '</span>'


def work_card(w):
    plates = ''.join(f' <a href="#{p}">{p}</a>' for p in w.get('plates', []))
    watch = ''
    if w.get('watch'):
        watch = f'<p><strong>Watch.</strong> <a href="{e(w["watch"]["url"])}">{e(w["watch"]["url"])}</a>. {e(w["watch"]["note"])}</p>'
    reading = f'<p><strong>Reading (inference).</strong> {e(w["reading"])}</p>' if w.get('reading') else ''
    search = ' '.join([w['id'], w['title'], w['venue'], w['what_happens'], w.get('reading') or '',
                       ' '.join(w['observed_symbols']), ' '.join(w['tags'])]).lower()
    return (f'<article class="card" id="{w["id"]}" data-group="{"titled" if w["description_status"] == "title only" else "described"}" '
            f'data-search="{e(search)}"><div class="meta">{w["id"]} · {e(w["year"])} · {e(w["description_status"])}</div>'
            f'<h2>{e(w["title"])}</h2><p class="small">{e(w["venue"])}</p>'
            f'<p><strong>What happens (sourced).</strong> {e(w["what_happens"])}</p>{reading}'
            f'<p><strong>Use.</strong> {e(w["use"])}{" Plates:" + plates if plates else ""}</p>{watch}'
            f'<p>{cite(w["source_ids"])}</p></article>')


def plate_card(p):
    used = [w['id'] for w in art['works'] if p['id'] in w.get('plates', [])]
    links = ' '.join(f'<a href="#{u}">{u}</a>' for u in used)
    return (f'<article class="card" id="{p["id"]}" data-group="plate" data-search="{e((p["id"] + " " + p["title"] + " " + p["maker"] + " " + p["why"]).lower())}">'
            f'<a href="{e(p["file"])}"><img src="previews/{p["id"]}.jpg" alt="{e(p["title"])}, {e(p["maker"])}" loading="lazy"></a>'
            f'<div class="meta">{p["id"]} · {e(p["license"])} · Wikimedia Commons</div><h2>{e(p["title"])}</h2>'
            f'<p class="small">{e(p["maker"])}, {e(p["date"])}</p><p>{e(p["why"])}</p><p class="small">Used with: {links}</p></article>')


n_works, n_plates = len(art['works']), len(art['plates'])
intro = (f'<div class="box"><p><strong>{n_works} pieces of Gilliam\'s animation (G01-G{n_works:02d}) and {n_plates} public-domain '
         f'source plates (S01-S{n_plates:02d}).</strong> {e(art["scope"])}</p><p>{e(art["rights"])}</p>'
         f'<p>{e(art["reading_rule"])}</p><p><strong>Start with:</strong> <a href="#G21">G21, the 1974 lesson</a>, '
         '<a href="#G06">G06, the foot</a>, <a href="#G10">G10, Killer Cars</a>, <a href="#G23">G23, God as a photograph</a>, '
         'then the <a href="director-guide.html">director\'s guide</a>.</p></div>')
controls = ('<div class="controls"><label>Search titles, symbols or tags<br><input id="search" type="search" '
            'placeholder="For example: foot, mortality, scale"></label><label>Show<br><select id="group">'
            '<option value="all">Everything</option><option value="described">Described pieces</option>'
            '<option value="titled">Title-only pieces</option><option value="plate">Public-domain plates</option>'
            '</select></label><span id="count" role="status" aria-live="polite"></span></div>')
script = ('<script>const q=document.getElementById("search"),g=document.getElementById("group"),c=document.getElementById("count"),'
          'cards=[...document.querySelectorAll(".card")];function f(){const t=q.value.trim().toLowerCase(),v=g.value;let n=0;'
          'cards.forEach(x=>{const ok=(v==="all"||x.dataset.group===v)&&(!t||x.dataset.search.includes(t));x.hidden=!ok;if(ok)n++});'
          'c.textContent=n+" shown"}q.addEventListener("input",f);g.addEventListener("change",f);f();</script>')
body = (intro + controls + '<h2 class="section">Gilliam\'s animation</h2><div class="grid">'
        + ''.join(work_card(w) for w in art['works']) + '</div><h2 class="section">Public-domain source plates</h2>'
        '<p class="prose">Free to cut. Provenance, sizes and SHA-256 are in <code>sources/plates-manifest.json</code>.</p>'
        '<div class="grid">' + ''.join(plate_card(p) for p in art['plates']) + '</div>' + script)
open(os.path.join(HERE, 'index.html'), 'w').write(
    page('Animation catalogue', 'His cut-out work 1968-1983, cited and linked, with the free paintings and prints it came from.', body))

secs = ''
for s in bio['sections']:
    facts = ''.join(f'<p>{e(f["text"])} {cite([f["source_id"]])}</p>' for f in s['facts'])
    secs += f'<section class="section"><h2>{e(s["title"])}</h2>{facts}</section>'
limits = '<section class="section"><h2>Limits of this biography</h2><ul>' + ''.join(f'<li>{e(x)}</li>' for x in bio['limits']) + '</ul></section>'
open(os.path.join(HERE, 'biography.html'), 'w').write(
    page('Biography', 'An American cartoonist who cut up Britain\'s respectable past, then spent forty years filming dreamers against systems.',
         '<div class="prose facts">' + secs + limits + '</div>'))
print('wrote index.html and biography.html:', n_works, 'works,', n_plates, 'plates')
