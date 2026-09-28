"""One paid Higgsfield job, done safely: upload (cached), estimate, cap check, submit ONCE, poll, download, log.

  python tools/gen.py <name> <job_type> <out_file> --prompt-file P [--param k=v ...] [--media flag=path_or_id ...]

- Uploads are cached by path in work/uploads.json (ids reused, retried on 520).
- A receipt work/jobs/<name>.json is written right after submit. If it exists, the job is never
  resubmitted: the script only polls and downloads it.
- The running total lives in work/ledger.json; a job whose estimate would push it past CAP is refused.
- Each completed job is appended to docs/SPEND.md (time, model, credits, what, job id).
"""
import argparse
import datetime
import json
import os
import subprocess
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
WORK = os.path.join(PROJ, "work")
CAP = 175.0
UPL = os.path.join(WORK, "uploads.json")
LEDGER = os.path.join(WORK, "ledger.json")


def hf(*args, js=True):
    cmd = ["higgsfield"] + (["--json"] if js else []) + list(args)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd[:4])}... failed: {r.stderr.strip()[:400]}")
    return r.stdout


def load(p, default):
    return json.load(open(p)) if os.path.exists(p) else default


def upload(path):
    if len(path) == 36 and path.count("-") == 4 and not os.path.exists(path):
        return path  # already an id
    ups = load(UPL, {})
    key = os.path.abspath(path)
    if key in ups:
        return ups[key]
    for i in range(4):
        try:
            mid = json.loads(hf("upload", "create", path))["id"]
            ups[key] = mid
            json.dump(ups, open(UPL, "w"), indent=1)
            return mid
        except Exception as e:  # 520s happen: retry
            print("upload retry", i, e, file=sys.stderr)
            time.sleep(4 + 4 * i)
    raise SystemExit(f"upload failed: {path}")


BASE = 49.5  # spent before tools/gen.py existed (wave 1 30, V1 4.5, LS1c 15)


def committed():
    """Spend = BASE + every receipt that is completed or still in flight (so parallel jobs count)."""
    jobs = {}
    d = os.path.join(WORK, "jobs")
    for f in os.listdir(d) if os.path.isdir(d) else []:
        if f.endswith(".json") and f.count(".") == 1:
            r = json.load(open(os.path.join(d, f)))
            jobs[r["job_id"]] = r["estimate"]
    return {"spent": round(BASE + sum(jobs.values()), 2), "jobs": jobs}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("job_type")
    ap.add_argument("out")
    ap.add_argument("--prompt-file", required=True)
    ap.add_argument("--param", action="append", default=[])
    ap.add_argument("--media", action="append", default=[], help="flag=path, e.g. image=work/x.png")
    ap.add_argument("--what", default="")
    a = ap.parse_args()
    os.makedirs(os.path.join(WORK, "jobs"), exist_ok=True)
    rec_p = os.path.join(WORK, "jobs", f"{a.name}.json")
    ledger = committed()
    args = [a.job_type, "--prompt", open(a.prompt_file).read().strip()]
    for kv in a.param:
        k, v = kv.split("=", 1)
        args += [f"--{k}", v]
    for kv in a.media:
        k, v = kv.split("=", 1)
        args += [f"--{k}", upload(v)]
    if os.path.exists(rec_p):
        rec = json.load(open(rec_p))
        print("receipt exists, resuming", rec["job_id"])
    else:
        est = float(hf("generate", "cost", *args, js=False).strip().split()[0])
        if ledger["spent"] + est > CAP:
            raise SystemExit(f"REFUSED: {ledger['spent']} + {est} would exceed the {CAP} cap")
        out = json.loads(hf("generate", "create", *args))
        jid = out[0] if isinstance(out, list) else out.get("id")
        rec = dict(job_id=jid, job_type=a.job_type, estimate=est, name=a.name, what=a.what,
                   submitted=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"))
        json.dump(rec, open(rec_p, "w"), indent=1)
        print("submitted", jid, est)
    while True:
        d = json.loads(hf("generate", "get", rec["job_id"]))
        d = d[0] if isinstance(d, list) else d
        st = d["status"]
        if st in ("completed", "failed", "nsfw", "canceled", "cancelled"):
            break
        time.sleep(10)
    rec["status"] = st
    json.dump(rec, open(rec_p, "w"), indent=1)
    if st != "completed":
        print("JOB", st, "(not charged)")
        os.rename(rec_p, rec_p.replace(".json", f".{st}.json"))
        raise SystemExit(2)
    urllib.request.urlretrieve(d["result_url"], a.out)
    if not rec.get("logged"):
        rec["logged"] = True
        json.dump(rec, open(rec_p, "w"), indent=1)
        ledger = committed()
        json.dump(ledger, open(LEDGER, "w"), indent=1)
        with open(os.path.join(PROJ, "docs", "SPEND.md"), "a") as f:
            f.write(f"| {rec['submitted']} | {a.job_type} | {rec['estimate']} | {a.name}: {a.what} | {rec['job_id']} |\n")
    print("done", a.out, "spent", ledger["spent"])


if __name__ == "__main__":
    main()
