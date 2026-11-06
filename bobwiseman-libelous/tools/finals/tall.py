# Writes 720x1280 RGB frames to stdout: a 1200x1080 window of each 1080p frame (centre from cx.json) scaled to 720x648
# in the middle, over the same frame blown up to fill the height, blurred and darkened.
import sys, json
from PIL import Image, ImageFilter, ImageEnhance
cx = json.load(open('work/finals/cx.json')); out = sys.stdout.buffer
for f in range(8171):
    im = Image.open(f'work/finals/wide/{f:06d}.jpg').convert('RGB'); c = cx[f]
    band = im.crop((c - 600, 0, c + 600, 1080)).resize((720, 648), Image.LANCZOS)
    k = 1280 / 1080; bx = int(c * k - 360); bx = min(max(bx, 0), int(1920 * k) - 720)
    bg = im.resize((480, 270), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6)).resize((int(1920 * k), 1280), Image.BILINEAR).crop((bx, 0, bx + 720, 1280))
    bg = ImageEnhance.Brightness(bg).enhance(0.45); bg.paste(band, (0, 316)); out.write(bg.tobytes())
