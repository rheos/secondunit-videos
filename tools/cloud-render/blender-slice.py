"""Render scene frames [a, b) of a .blend with the bpy wheel (blender-render.yml): python blender-slice.py scene.blend a b outdir
Writes outdir/f00000.png ... (absolute frame numbers) and prints which GL renderer EEVEE got and the time per frame."""
import os, sys, time
import bpy

blend, a, b, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(blend))
sc = bpy.context.scene
try:
    import gpu
    print("gpu:", gpu.platform.backend_type_get(), gpu.platform.vendor_get(), gpu.platform.renderer_get(), flush=True)
except Exception as exc:
    print("gpu module:", exc, flush=True)
im = sc.render.image_settings
if "media_type" in im.bl_rna.properties: im.media_type = "IMAGE"     # 5.x
im.file_format = "PNG"; im.color_mode = "RGB"; im.color_depth = "8"
os.makedirs(out, exist_ok=True)
t0 = time.time()
for f in range(a, b):
    sc.frame_set(f); sc.render.filepath = os.path.join(os.path.abspath(out), f"f{f:05d}.png")
    t = time.time(); bpy.ops.render.render(write_still=True)
    print(f"f{f} {time.time() - t:.1f} s", flush=True)
print(f"done {b - a} frames in {time.time() - t0:.0f} s", flush=True)
