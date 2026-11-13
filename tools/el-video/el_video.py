# /// script
# requires-python = ">=3.11"
# dependencies = ["elevenlabs>=2.77", "python-dotenv>=1.0"]
# ///
"""Run ElevenLabs video generations (Seedance, Veo) from a JSON job file.

    uv run tools/el-video/el_video.py submit <job.json>     # uploads refs, submits, logs credits used
    uv run tools/el-video/el_video.py wait <job.json>       # polls every 15 s, saves the MP4

The SDK reads ELEVENLABS_API_KEY. If it isn't set, this loads it from the umbrella's gitignored
~/Code/novadiem/indieagent/.env.local (made by `elevenlabs onboard connect`). The key never goes in code.

A job file (paths relative to the job file):
    {"model": "bytedance-seedance-v2.5", "prompt": "... @Image1 ... @Video1 ... @Audio1 ...",
     "images": ["../work/refs/sheet.png"], "videos": [], "audios": ["../work/refs/line_5s.wav"],
     "params": {"aspect_ratio": "9:16", "resolution": "720p", "duration_secs": 5, "generate_audio": true},
     "out": "../work/el/seedance_A.mp4"}
@ImageN / @VideoN / @AudioN in the prompt count from 1 in each list's order.
State (asset ids by file sha256, generation id, credits used) goes to <job>.state.json beside the job;
keep job folders' state out of git if they hold ids you don't want shared.

There is no estimate endpoint: the price is charged on submit. The credit delta is read from
/v1/user/subscription before and after, so run one job at a time when you need exact costs.
Seedance needs ElevenLabs to approve ByteDance models for the account; until then submit fails with
403 model_access_denied and nothing is charged.
"""
import hashlib, json, os, sys, time, pathlib, urllib.request
from dotenv import load_dotenv

if not os.environ.get("ELEVENLABS_API_KEY"):
    load_dotenv(pathlib.Path("~/Code/novadiem/indieagent/.env.local").expanduser())

from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError
from elevenlabs import types as T

REQ = {
    "bytedance-seedance-v2.5": T.VideoGenerationRequest_BytedanceSeedanceV25,
    "bytedance-seedance-v2": T.VideoGenerationRequest_BytedanceSeedanceV2,
    "bytedance-seedance-v2-fast": T.VideoGenerationRequest_BytedanceSeedanceV2Fast,
    "bytedance-seedance-v2-mini": T.VideoGenerationRequest_BytedanceSeedanceV2Mini,
    "veo-3.1-generate-001": T.VideoGenerationRequest_Veo31Generate001,
    "veo-3.1-fast-generate-001": T.VideoGenerationRequest_Veo31FastGenerate001,
}
REF = {"images": T.ImageReference_Asset, "videos": T.VideoReference_Asset, "audios": T.AudioReference_Asset}

client = ElevenLabs()


def credits_used():
    return client.user.subscription.get().character_count


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def load(job_path):
    job = json.loads(job_path.read_text())
    sp = job_path.with_suffix(".state.json")
    state = json.loads(sp.read_text()) if sp.exists() else {"assets": {}}
    return job, state, sp


def asset_id(path, state, sp):
    h = sha(path)
    if h not in state["assets"]:
        with open(path, "rb") as f:
            a = client.assets.create(asset=(path.name, f), name=path.name)
        state["assets"][h] = a.asset_id
        sp.write_text(json.dumps(state, indent=2))
        print("uploaded", path.name, a.asset_id)
    return state["assets"][h]


def submit(job_path):
    job, state, sp = load(job_path)
    if state.get("generation_id"):
        sys.exit(f"already submitted: {state['generation_id']} (delete it from {sp.name} to run again)")
    refs = {}
    for kind, Ref in REF.items():
        paths = [(job_path.parent / p).resolve() for p in job.get(kind, [])]
        if paths:
            refs[kind] = [Ref(asset_id=asset_id(p, state, sp)) for p in paths]
    req = REQ[job["model"]](prompt=job["prompt"], **job.get("params", {}), **refs)
    before = credits_used()
    try:
        g = client.flows.video.create(request=req)
    except ApiError as e:
        sys.exit(f"refused {e.status_code}: {json.dumps(e.body)[:500]}")
    time.sleep(5)
    used = credits_used() - before
    state.update(generation_id=g.id, credits=used, submitted=time.strftime("%Y-%m-%dT%H:%M:%S%z"))
    sp.write_text(json.dumps(state, indent=2))
    print(f"submitted {g.id}, {used} credits")


def wait(job_path):
    job, state, sp = load(job_path)
    gid = state["generation_id"]
    while True:
        g = client.flows.video.get(gid)
        print(g.status, flush=True)
        if g.status in ("completed", "failed"):
            break
        time.sleep(15)
    state["status"] = g.status
    sp.write_text(json.dumps(state, indent=2))
    if g.status == "failed":
        sys.exit(json.dumps(g.dict(), default=str)[:800])
    out = (job_path.parent / job["out"]).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(g.content_url, out)
    print("saved", out)


if __name__ == "__main__":
    cmd, job = sys.argv[1], pathlib.Path(sys.argv[2]).resolve()
    {"submit": submit, "wait": wait}[cmd](job)
