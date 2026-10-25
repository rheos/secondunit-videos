"""Render a Pet act on Modal CPUs: Blender 4.5.14 as the `bpy` wheel (the same version as this Mac, so the stills
checked here are what renders there), the lab folder mounted into the container, each act script run as it runs locally
and its frames pulled back.

    modal run cloud/modal_pet.py --act 1                         # whole act, 8 containers of 8 cores
    modal run cloud/modal_pet.py --act 1 --frames 520,700,880    # a few frames, one container
    modal run cloud/modal_pet.py --act 1 --chunks 12 --res 100

Frames land in out/film/pet/act<N>/frames/<frame:05d>.png, where the local --render would put them, so
tools/film_encode.sh and the act join work the same. EEVEE on Mesa's llvmpipe (no GPU on the account): 2026-10-16
numbers were 5-9 s a frame at 960x540 on 8 cores; expect 10-20 s at 1280x720. CPU is $0.047 per core-hour, so a
3,981-frame song is about $4-6 at 8 chunks. Long renders go here, never to this Mac (it crashes on them).
"""
import os
import pathlib
import time

import modal

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
APT = ["libxkbcommon0", "libxi6", "libxxf86vm1", "libxfixes3", "libxrender1", "libsm6", "libx11-6",
       "libgl1", "libegl1", "libglvnd0", "libgles2", "libegl-mesa0", "libgl1-mesa-dri",
       "libvulkan1", "mesa-vulkan-drivers"]
LAB = ["canvas_kit.py", "film_kit.py", "pet_world.py"] + [f"pet_act{i}.py" for i in range(8)]
IMG = (modal.Image.debian_slim(python_version="3.11").apt_install(*APT).uv_pip_install("bpy==4.5.14")
       .add_local_dir(ROOT, remote_path="/lab", ignore=lambda p: not (p.name in LAB)))

app = modal.App("pet-render")
# Every frame is also saved to this volume as it renders, so a Mac crash mid-run loses nothing (2026-10-24: the client
# died 9 min into act 2 and the containers' finished frames, held for the return, went with it). Run with
# `modal run --detach ...` and fetch afterwards: modal volume get pet-frames act2 out/film/pet/act2/vol
VOL = modal.Volume.from_name("pet-frames", create_if_missing=True)


@app.function(image=IMG, cpu=8, memory=8192, timeout=3 * 3600, volumes={"/vol": VOL})
def render_act(act: int, frames: list[int], res: int, samples: int):
    """Build the act's scene (the script runs to run(OUT), which renders nothing without --render/--stills) and render
    the given frames one by one; returns {frame: png bytes} plus timings."""
    import io, sys
    from contextlib import redirect_stdout
    import bpy
    sys.path.insert(0, "/lab"); os.chdir("/lab")
    sys.argv = ["blender", "--"]                      # no --stills / --render: build only
    t0 = time.time()
    src = pathlib.Path(f"/lab/pet_act{act}.py").read_text()
    buf = io.StringIO()
    with redirect_stdout(buf):
        exec(compile(src, f"pet_act{act}.py", "exec"), {"__name__": "__main__", "__file__": f"/lab/pet_act{act}.py"})
    scn = bpy.context.scene
    scn.render.resolution_percentage = res
    scn.eevee.taa_render_samples = samples
    build_s = time.time() - t0
    out, times = {}, []
    for f in frames:
        t = time.time()
        scn.frame_set(f)
        scn.render.filepath = f"/tmp/{f:05d}.png"
        bpy.ops.render.render(write_still=True)
        out[f] = pathlib.Path(scn.render.filepath).read_bytes()
        d = pathlib.Path(f"/vol/act{act}"); d.mkdir(parents=True, exist_ok=True)
        (d / f"{f:05d}.png").write_bytes(out[f])
        if len(out) % 3 == 0: VOL.commit()
        times.append(round(time.time() - t, 1))
    VOL.commit()
    try:
        import gpu
        renderer = gpu.platform.renderer_get()
    except Exception as exc:
        renderer = f"unavailable: {exc}"
    return {"frames": out, "build_s": round(build_s, 1), "frame_s": times, "renderer": renderer,
            "log_tail": buf.getvalue()[-600:]}


ACT_FRAMES = {0: (0, 503), 1: (504, 1183), 2: (1183, 1654), 3: (1654, 1956), 4: (1956, 2539), 5: (2539, 3130),
              6: (3130, 3396), 7: (3396, 3980)}


def _parse(spec):
    out = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-"); out += range(int(a), int(b) + 1)
        elif part: out.append(int(part))
    return out


@app.local_entrypoint()
def main(act: int = 1, frames: str = "", chunks: int = 8, res: int = 100, samples: int = 16):
    f0, f1 = ACT_FRAMES[act]
    wanted = _parse(frames) if frames else list(range(f0, f1 + 1))
    groups = [wanted] if frames and len(wanted) <= 12 else [wanted[i::chunks] for i in range(chunks)]
    groups = [g for g in groups if g]
    out_dir = ROOT / "out" / "film" / "pet" / f"act{act}" / "frames"
    out_dir.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    n = 0
    for r in render_act.starmap([(act, g, res, samples) for g in groups]):
        for f, png in r.pop("frames").items():
            (out_dir / f"{f:05d}.png").write_bytes(png); n += 1
        print({k: (v if k != "frame_s" else (min(v), max(v), round(sum(v) / len(v), 1))) for k, v in r.items() if k != "log_tail"})
    wall = time.time() - t0
    cpu_h = len(groups) * 8 * (wall / 3600)
    print(f"[modal] act {act}: {n} frames in {len(groups)} containers, {wall:.0f} s wall, about {cpu_h:.1f} core-h "
          f"(~${cpu_h * 0.047:.2f}) -> {out_dir}")
