"""Build out/board.png from out/<medium>_<scene>_16x9.png: columns are mediums, rows are scenes."""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
d = json.loads((HERE / "prompts.json").read_text())
mediums, scenes = list(d["mediums"]), list(d["scenes"])
W, H, PAD, TOP, ROWLAB = 640, 360, 28, 150, 34
font = lambda s, b=False: ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if b else "/System/Library/Fonts/Supplemental/Arial.ttf", s)
cw = PAD + len(mediums) * (W + PAD)
ch = TOP + len(scenes) * (ROWLAB + H + PAD) + PAD
board = Image.new("RGB", (cw, ch), "#f6f3ec")
g = ImageDraw.Draw(board)
g.text((PAD, 24), "10,000 Miles: style board", font=font(34, True), fill="#22252b")
g.text((PAD, 70), "Bob Wiseman. Same two scenes in three mediums; pick the medium, not the picture.", font=font(18), fill="#6b6f78")
for i, m in enumerate(mediums):
    x = PAD + i * (W + PAD)
    g.text((x, 108), f"{i+1}  {d['mediums'][m]['name']}", font=font(22, True), fill="#22252b")
    g.text((x, 136 - 4), d["mediums"][m]["line"], font=font(15), fill="#6b6f78")
labels = {"liftoff": "rooftop liftoff, dusk", "town": "restless town, night"}
for r, s in enumerate(scenes):
    y = TOP + r * (ROWLAB + H + PAD)
    g.text((PAD, y + 8), labels.get(s, s), font=font(16), fill="#6b6f78")
    for i, m in enumerate(mediums):
        im = Image.open(HERE / "out" / f"{m}_{s}_16x9.png").convert("RGB").resize((W, H), Image.LANCZOS)
        board.paste(im, (PAD + i * (W + PAD), y + ROWLAB))
board.save(HERE / "out" / "board.png")
print(HERE / "out" / "board.png", board.size)
