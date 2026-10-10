"""Write prompts/<run>/05_overlay.js for every hook shot: tools/hook/common.js + tools/hook/shots/<run>.js."""
import pathlib
root = pathlib.Path(__file__).resolve().parents[2]
common = (root / "tools/hook/common.js").read_text()
for shot in sorted((root / "tools/hook/shots").glob("s0*.js")):
    out = root / "prompts" / shot.stem / "05_overlay.js"
    body = shot.read_text()
    # START must be defined before common.js uses it at draw time; both are plain scripts, order is fine at runtime
    out.write_text(body.split("\n", 2)[0] + "\n" + common + "\n" + "\n".join(body.split("\n")[1:]))
    print(out.relative_to(root))
