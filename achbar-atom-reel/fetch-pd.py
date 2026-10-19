# Re-download the public-domain archival photos listed in assets/pd/manifest.json from Wikimedia Commons
# (the JPEGs are gitignored). Checks each file against the manifest's sha256.
# Run: python3 -I fetch-pd.py
import json, urllib.request, urllib.parse, hashlib, os
H = {"User-Agent": "novadiem-research/1.0 (robin@novadiem.com)"}
here = os.path.dirname(os.path.abspath(__file__)); d = os.path.join(here, "assets", "pd")
man = json.load(open(os.path.join(d, "manifest.json")))
commons = [x for x in man if x.get("title")]
q = urllib.parse.urlencode({"action": "query", "titles": "|".join(x["title"] for x in commons), "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 2400, "format": "json"})
pages = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=H)))["query"]["pages"].values()
urls = {p["title"]: (p["imageinfo"][0].get("thumburl") or p["imageinfo"][0]["url"]) for p in pages if "imageinfo" in p}
for x in man:
    if not x.get("title"):   # a PDF by URL (LA-602): page 2 rendered with pdftoppm into the same JPEG
        import subprocess, tempfile
        pdf = urllib.request.urlopen(urllib.request.Request(x["url"], headers=H)).read()
        with tempfile.TemporaryDirectory() as td:
            open(os.path.join(td, "doc.pdf"), "wb").write(pdf)
            subprocess.run(["pdftoppm", "-r", "220", "-f", "2", "-l", "2", "-jpeg", "-jpegopt", "quality=92", os.path.join(td, "doc.pdf"), os.path.join(td, "p")], check=True)
            data = open(os.path.join(td, "p-02.jpg"), "rb").read()
        ok = hashlib.sha256(data).hexdigest() == x["sha256"]
        open(os.path.join(d, x["file"]), "wb").write(data); print(x["file"], "ok" if ok else "CHANGED (pdftoppm version?)"); continue
    data = urllib.request.urlopen(urllib.request.Request(urls[x["title"]], headers=H)).read()
    ok = hashlib.sha256(data).hexdigest() == x["sha256"]
    open(os.path.join(d, x["file"]), "wb").write(data); print(x["file"], "ok" if ok else "CHANGED upstream")
