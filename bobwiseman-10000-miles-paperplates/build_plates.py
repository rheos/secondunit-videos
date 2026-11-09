"""Trim every painted layer in work/plates/ to its alpha box and write work/plates.js (WebP data URLs, so the canvas
stays untainted on file:// pages). Run after paint.sh; needs Pillow."""
import base64, io, json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
out = {}
for f in sorted((HERE / "work" / "plates").glob("*.png")):
    im = Image.open(f).convert("RGBA")
    box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox() or (0, 0, *im.size)
    im = im.crop(box)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=90, method=5)
    out[f.stem] = {"w": im.width, "h": im.height, "src": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()}
    print(f.stem, im.size, len(buf.getvalue()) // 1024, "KB")
(HERE / "work" / "plates.js").write_text("// built by build_plates.py, do not edit\nconst PLATES = " + json.dumps(out) + ";\n")
