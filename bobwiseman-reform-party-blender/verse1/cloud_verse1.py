"""Render the verse 1 build on Modal (Blender 4.5.14 from the bpy wheel), N containers in parallel.

    modal run verse1/cloud_verse1.py --frames 1-570 --chunks 12 --res 1280x720 --tag v1
    modal run verse1/cloud_verse1.py --frames 1,200,400 --tag probe           # a cost probe

CPU only for now (RP_GPU=cpu default): EEVEE on Mesa's software GL. A GPU needs a card on file at Modal
(RP_GPU=L4). The modules and the exported state (out/state/*.json) go up as arguments; nothing else from
the Mac leaves it, and no audio or lyrics are in them. Frames land in out/cloud/<tag>/fNNNN.png and the
run prints build and per-frame seconds per container, which is what the cost estimate is made from.
"""
import os
import pathlib
import time

import modal

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
GPU = os.environ.get("RP_GPU", "cpu")
GPU_ARG = None if GPU.lower() == "cpu" else GPU
CPUS = int(os.environ.get("RP_CPUS", 8))

APT = ["libxkbcommon0", "libxi6", "libxxf86vm1", "libxfixes3", "libxrender1", "libsm6", "libx11-6",
       "libgl1", "libegl1", "libglvnd0", "libgles2", "libegl-mesa0", "libgl1-mesa-dri",
       "libvulkan1", "mesa-vulkan-drivers"]
IMG = (modal.Image.debian_slim(python_version="3.11").apt_install(*APT).uv_pip_install("bpy==4.5.14")
       .env({"NVIDIA_DRIVER_CAPABILITIES": "all"}))
app = modal.App("reform-party-verse1")


@app.function(image=IMG, gpu=GPU_ARG, cpu=CPUS, memory=8192, timeout=3600)
def render(files, frames, res, samples, only=""):
    import runpy
    import sys
    work = pathlib.Path("/tmp/work")
    for rel, text in files.items():
        p = work / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)
    t0 = time.time()
    sys.argv = ["blender", "--", "--res", res, "--samples", str(samples)] + (["--only", only] if only else [])
    runpy.run_path(str(work / "verse1" / "verse1.py"), run_name="__main__")
    import bpy
    scn = bpy.context.scene
    build_s = time.time() - t0
    out, times = {}, []
    for f in frames:
        t = time.time()
        scn.frame_set(f)
        scn.render.filepath = f"/tmp/f{f:04d}.png"
        bpy.ops.render.render(write_still=True)
        out[f] = pathlib.Path(scn.render.filepath).read_bytes()
        times.append(round(time.time() - t, 2))
    return {"frames": out, "version": bpy.app.version_string, "build_s": round(build_s, 1), "frame_s": times}


def _parse(spec):
    fs = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            fs += range(int(a), int(b) + 1)
        elif part:
            fs.append(int(part))
    return fs


@app.local_entrypoint()
def main(frames: str = "1,200,400", chunks: int = 1, res: str = "1280x720", samples: int = 16, tag: str = "probe", only: str = ""):
    files = {str(p.relative_to(ROOT)): p.read_text() for p in sorted((ROOT / "verse1").glob("rp_*.py"))}
    files["verse1/verse1.py"] = (ROOT / "verse1" / "verse1.py").read_text()
    for p in sorted((ROOT / "out" / "state").glob("*.json")):
        files[str(p.relative_to(ROOT))] = p.read_text()
    wanted = _parse(frames)
    n = max(1, min(chunks, len(wanted)))
    size = -(-len(wanted) // n)
    groups = [wanted[i:i + size] for i in range(0, len(wanted), size)]     # contiguous runs: one build each
    out_dir = ROOT / "out" / "cloud" / tag
    out_dir.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    total_cpu_s = 0.0
    for r in render.starmap([(files, g, res, samples, only) for g in groups]):
        for f, png in r.pop("frames").items():
            (out_dir / f"f{f:04d}.png").write_bytes(png)
        busy = r["build_s"] + sum(r["frame_s"])
        total_cpu_s += busy
        fs = r["frame_s"]
        print(f"[cloud] {r['version']} build {r['build_s']} s, {len(fs)} frames, median {sorted(fs)[len(fs) // 2]} s, busy {busy:.0f} s")
    wall = time.time() - t0
    core_h = total_cpu_s / 3600 * CPUS
    print(f"[cloud] {len(wanted)} frames on {len(groups)} x {GPU} ({CPUS} cores) in {wall:.0f} s wall; "
          f"{total_cpu_s / 60:.1f} container-min, {core_h:.2f} core-h, ~${core_h * 0.047:.2f} at $0.047/core-h (CPU only, memory extra) -> {out_dir}")
