#!/usr/bin/env python3
"""Spike S2 sheet worker (throwaway), runs as runner. Polls /srv/ar/scratch/spool/req, re-validates each request,
runs one `docker run --network none` draw in the pinned Playwright image, writes spool/rep/<id>.json.
Logs to /srv/ar/out/worker.log (no page content, no fonts of the song)."""
import json
import os
import re
import subprocess
import time

SPOOL = '/srv/ar/scratch/spool'
IMG = 'mcr.microsoft.com/playwright@sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29'
LOG = '/srv/ar/out/worker.log'


def log(msg: str) -> None:
    with open(LOG, 'a') as f:
        f.write(f"{time.strftime('%H:%M:%S')} {msg}\n")


def docker_cmd(out_dir: str, page: str, times: list, mountpoint_ok: bool) -> list:
    return ['docker', 'run', '--rm', '--network', 'none', '--user', '1001:1001', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '--pids-limit', '512', '--memory', '6g', '--read-only',
            '--tmpfs', '/tmp', '-e', 'HOME=/tmp',
            '-v', '/srv/ar/mv:/w:ro', '-v', '/srv/ar/work/node_modules:/w/node_modules:ro',
            '-v', f'{out_dir}:/out:rw', '-v', '/opt/ar-tools/draw.mjs:/opt/draw.mjs:ro',
            '-w', '/w/song', IMG, 'node', '/opt/draw.mjs', page, json.dumps(times)]


def handle(path: str) -> None:
    with open(path) as f:
        req = json.load(f)
    rid = str(req.get('id', ''))
    page, times = req.get('page'), req.get('times')
    ok = (re.fullmatch(r'[a-f0-9]{12}', rid) and req.get('tool') in ('contact_sheet', 'stills')
          and isinstance(page, str) and re.fullmatch(r'[A-Za-z0-9._-]+\.html', page)
          and isinstance(times, list) and 1 <= len(times) <= (12 if req['tool'] == 'contact_sheet' else 4)
          and all(isinstance(t, (int, float)) for t in times))
    rep = os.path.join(SPOOL, 'rep', f'{rid}.json')
    if not ok:
        log('invalid request refused')
        if re.fullmatch(r'[a-f0-9]{12}', rid):
            with open(rep, 'w') as f:
                json.dump({'error': True, 'text': 'invalid request'}, f)
        return
    out_dir = f'/srv/ar/scratch/sheets/{rid}'
    os.makedirs(out_dir, exist_ok=True)
    notes = []
    t0 = time.time()
    r = subprocess.run(docker_cmd(out_dir, page, times, False), capture_output=True, text=True, timeout=170)
    if r.returncode != 0 and 'read-only' in (r.stderr or '').lower():
        # nested mount inside a read-only bind: pre-create the mountpoint on the host and retry
        notes.append('nested mount failed on a read-only bind; retried with a pre-created mountpoint')
        os.makedirs('/srv/ar/mv/node_modules', exist_ok=True)
        r = subprocess.run(docker_cmd(out_dir, page, times, True), capture_output=True, text=True, timeout=170)
    secs = round(time.time() - t0, 1)
    if r.returncode == 0:
        text = f"sheet drawn in {secs}s: {r.stdout.strip().splitlines()[-1]}"
        log(f'req {rid} ok {secs}s; ' + '; '.join(notes))
        body = {'error': False, 'text': text, 'notes': notes}
    else:
        first = (r.stderr or '').strip().splitlines()[:1]
        log(f'req {rid} failed rc={r.returncode} {first}')
        body = {'error': True, 'text': f'draw failed rc={r.returncode}: {first}', 'notes': notes}
    tmp = os.path.join(SPOOL, 'rep', f'.{rid}.tmp')
    with open(tmp, 'w') as f:
        json.dump(body, f)
    os.rename(tmp, rep)


log('worker start')
seen = set()
while True:
    for name in sorted(os.listdir(f'{SPOOL}/req')):
        if name.startswith('.') or not name.endswith('.json') or name in seen:
            continue
        seen.add(name)
        try:
            handle(os.path.join(SPOOL, 'req', name))
        except Exception as e:  # noqa: BLE001
            log(f'handler error {type(e).__name__}')
    time.sleep(0.25)
