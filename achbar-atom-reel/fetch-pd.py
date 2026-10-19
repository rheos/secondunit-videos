# Re-download the public-domain archival photos listed in assets/pd/manifest.json from Wikimedia Commons
# (the JPEGs are gitignored). Checks each file against the manifest's sha256.
# Run: python3 -I fetch-pd.py
import json, urllib.request, urllib.parse, hashlib, os
H = {"User-Agent": "novadiem-research/1.0 (robin@novadiem.com)"}
here = os.path.dirname(os.path.abspath(__file__)); d = os.path.join(here, "assets", "pd")
man = json.load(open(os.path.join(d, "manifest.json")))
q = urllib.parse.urlencode({"action": "query", "titles": "|".join(x["title"] for x in man), "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 2400, "format": "json"})
pages = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=H)))["query"]["pages"].values()
urls = {p["title"]: (p["imageinfo"][0].get("thumburl") or p["imageinfo"][0]["url"]) for p in pages if "imageinfo" in p}
for x in man:
    data = urllib.request.urlopen(urllib.request.Request(urls[x["title"]], headers=H)).read()
    ok = hashlib.sha256(data).hexdigest() == x["sha256"]
    open(os.path.join(d, x["file"]), "wb").write(data); print(x["file"], "ok" if ok else "CHANGED upstream")
