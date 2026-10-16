"""Run the orb lab on Modal: Blender 5.2 (or 4.5) in the cloud, on CPU for probes and on a GPU for renders.

This Mac is a 2019 Intel MacBook Pro, and Blender 5 ships for Apple silicon only, so 5.x runs here.
Blender comes from the `bpy` wheel on PyPI (5.2.2 needs Python 3.13, 4.5.14 needs 3.11).

    modal run cloud/modal_blender.py --mode probe  --blender 5.2                         # API probe, CPU only
    modal run cloud/modal_blender.py --mode stills --blender 5.2 --frames 1,150,365,445  # one GPU
    modal run cloud/modal_blender.py --mode full   --blender 5.2 --res 67 --chunks 8     # whole piece, N GPUs

Output lands in out/cloud/<tag>/ (gitignored). Pick the GPU with ORB_GPU=L4|A10|L40S (default L4),
or ORB_GPU=cpu to render with EEVEE on Mesa's software renderer (slow, but no card needed).
Cost reference (modal.com/pricing, 2026-10-16): L4 $0.80/h, L40S $1.95/h, CPU $0.047/core-h,
Starter plan includes $30/month.
"""
import io
import os
import pathlib
import subprocess
import time
from contextlib import redirect_stdout

import modal

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
GPU = os.environ.get("ORB_GPU", "L4")
GPU_ARG = None if GPU.lower() == "cpu" else GPU      # ORB_GPU=cpu: no GPU (Modal needs a card on file for GPUs)

# Runtime libraries the bpy wheel links against, plus EGL/GL/Vulkan so EEVEE can find a GPU
# (or fall back to Mesa's software renderer, which tells us EEVEE got no GPU).
APT = ["libxkbcommon0", "libxi6", "libxxf86vm1", "libxfixes3", "libxrender1", "libsm6", "libx11-6",
       "libgl1", "libegl1", "libglvnd0", "libgles2", "libegl-mesa0", "libgl1-mesa-dri",
       "libvulkan1", "mesa-vulkan-drivers"]
ENV = {"NVIDIA_DRIVER_CAPABILITIES": "all"}  # ask for graphics, not just compute, from the NVIDIA runtime

IMG_52 = modal.Image.debian_slim(python_version="3.13").apt_install(*APT).uv_pip_install("bpy==5.2.2").env(ENV)
IMG_45 = modal.Image.debian_slim(python_version="3.11").apt_install(*APT).uv_pip_install("bpy==4.5.14").env(ENV)

app = modal.App("blender-orb-lab")


# ---------------------------------------------------------------------------------------- container side
def _probe(src):
    buf = io.StringIO()
    with redirect_stdout(buf):
        exec(compile(src, "probe_api.py", "exec"), {"__name__": "__main__"})
    return buf.getvalue()


def _gpu_info():
    info = {}
    try:
        info["nvidia_smi"] = subprocess.run(["nvidia-smi", "--query-gpu=name,driver_version", "--format=csv,noheader"],
                                            capture_output=True, text=True, timeout=20).stdout.strip()
    except Exception as exc:
        info["nvidia_smi"] = f"unavailable: {exc}"
    try:
        import gpu
        info["gpu_backend"] = gpu.platform.backend_type_get()
        info["gpu_vendor"] = gpu.platform.vendor_get()
        info["gpu_renderer"] = gpu.platform.renderer_get()
    except Exception as exc:
        info["gpu_module"] = f"unavailable: {exc}"
    return info


def _render(script_src, frames, res, samples):
    import bpy
    t0 = time.time()
    exec(compile(script_src, "orb_visualizer.py", "exec"), {"__name__": "__main__"})
    scn = bpy.context.scene
    scn.render.resolution_x, scn.render.resolution_y, scn.render.resolution_percentage = 1920, 1080, res
    scn.eevee.taa_render_samples = samples
    im = scn.render.image_settings
    if "media_type" in im.bl_rna.properties:      # 5.x splits still images from video
        im.media_type = "IMAGE"
    im.file_format = "PNG"
    build_s = time.time() - t0
    out, times = {}, []
    for f in frames:
        t = time.time()
        scn.frame_set(f)
        scn.render.filepath = f"/tmp/f{f:04d}.png"
        bpy.ops.render.render(write_still=True)
        out[f] = pathlib.Path(scn.render.filepath).read_bytes()
        times.append(round(time.time() - t, 2))
    return {"frames": out, "version": bpy.app.version_string, "engine": scn.render.engine,
            "build_s": round(build_s, 2), "frame_s": times, **_gpu_info()}


@app.function(image=IMG_52, cpu=2, timeout=600)
def probe_52(src):
    return _probe(src)


@app.function(image=IMG_45, cpu=2, timeout=600)
def probe_45(src):
    return _probe(src)


@app.function(image=IMG_52, gpu=GPU_ARG, cpu=8, timeout=3600)
def render_52(script_src, frames, res, samples):
    return _render(script_src, frames, res, samples)


@app.function(image=IMG_45, gpu=GPU_ARG, cpu=8, timeout=3600)
def render_45(script_src, frames, res, samples):
    return _render(script_src, frames, res, samples)


# -------------------------------------------------------------------------------------------- local side
def _parse_frames(spec):
    frames = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            frames += range(int(a), int(b) + 1)
        elif part:
            frames.append(int(part))
    return frames


@app.local_entrypoint()
def main(mode: str = "stills", blender: str = "5.2", frames: str = "1,150,365,445", res: int = 50,
         samples: int = 16, chunks: int = 8, tag: str = ""):
    ver = blender.replace(".", "")
    out_dir = ROOT / "out" / "cloud" / (tag or f"{mode}-{ver}")
    out_dir.mkdir(parents=True, exist_ok=True)

    if mode == "probe":
        text = {"52": probe_52, "45": probe_45}[ver].remote((ROOT / "tools" / "probe_api.py").read_text())
        (out_dir / f"probe-{ver}.txt").write_text(text)
        print(text)
        return

    script = (ROOT / "orb_visualizer.py").read_text()
    render = {"52": render_52, "45": render_45}[ver]
    if mode == "full":
        frames = "1-576" if frames == "1,150,365,445" else frames
    wanted = _parse_frames(frames)
    groups = [wanted] if mode == "stills" else [wanted[i::chunks] for i in range(chunks)]

    t0 = time.time()
    results = list(render.starmap([(script, g, res, samples) for g in groups if g]))
    wall = time.time() - t0
    for r in results:
        for f, png in r.pop("frames").items():
            (out_dir / f"f{f:04d}.png").write_bytes(png)
        print({k: v for k, v in r.items()})
    print(f"[cloud] {len(wanted)} frames on {len(results)} x {GPU} in {wall:.0f} s wall -> {out_dir}")

    if mode == "full":
        mp4 = out_dir.parent / f"{out_dir.name}.mp4"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-framerate", "24", "-start_number", str(wanted[0]),
                        "-i", str(out_dir / "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                        str(mp4)], check=True)
        print(f"[cloud] video -> {mp4}")
