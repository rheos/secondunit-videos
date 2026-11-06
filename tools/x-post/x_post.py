"""x_post.py · post a video to X as @rheostatiko (Robin's personal account), with his explicit go.

    uv run --with requests python tools/x-post/x_post.py <video.mp4> --text "..." [--text-file post.txt] [--post]
    uv run --with requests python tools/x-post/x_post.py --whoami

Without --post nothing leaves this machine except a token check: it prints the plan (file, size, text, length).
With --post it uploads the video in 4 MB chunks (v2 media upload: initialize, append, finalize, then polls
processing), creates the post, prints its URL, and logs it to secondunit/X-POSTS.jsonl beside UPLOADS.jsonl.

Credentials: ~/Documents/novadiem/keys/x/rheostatiko.env. Preferred: the OAuth 1.0a Access Token and Secret pair
(X_ACCESS_TOKEN / X_ACCESS_SECRET with the app's X_API_KEY / X_API_SECRET): it carries the app's read-and-write
permission, never expires, and can upload media. Fallback: the OAuth 2.0 user token (X_OAUTH2_*), refreshed on a 401
with the refresh token and client id, the rotated pair written back atomically. The portal's OAuth 2.0 generator
issues a fixed scope list WITHOUT media.write (checked 2026-10-26), so that token can post text but not video.

Posting is public and permanent: the script never posts unless --post is given, and Claude only passes --post on
Robin's explicit go for that specific post.
"""
import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from requests_oauthlib import OAuth1

ENV = Path.home() / 'Documents/novadiem/keys/x/rheostatiko.env'
LOG = Path.home() / 'Code/novadiem/indieagent/secondunit/X-POSTS.jsonl'
API = 'https://api.x.com/2'
CHUNK = 4 * 1024 * 1024


def read_env():
    env = {}
    for line in ENV.read_text().splitlines():
        m = re.match(r'^([A-Z_0-9]+)=(.*)$', line)
        if m: env[m.group(1)] = m.group(2).strip()
    return env


def write_env(updates):
    text = ENV.read_text()
    for k, v in updates.items():
        text, n = re.subn(rf'^{k}=.*$', f'{k}={v}', text, flags=re.M)
        if not n: text += f'\n{k}={v}\n'
    tmp = ENV.with_suffix('.env.tmp'); tmp.write_text(text); os.chmod(tmp, 0o600); tmp.replace(ENV)


class X:
    def __init__(self):
        self.env = read_env(); e = self.env
        self.oauth1 = None
        if e.get('X_ACCESS_TOKEN') and e.get('X_ACCESS_SECRET'):
            self.oauth1 = OAuth1(e['X_API_KEY'], e['X_API_SECRET'], e['X_ACCESS_TOKEN'], e['X_ACCESS_SECRET'])
        self.token = e.get('X_OAUTH2_ACCESS_TOKEN', '')
        if not self.oauth1 and not self.token: sys.exit('no credentials in ' + str(ENV))
        self.route = 'OAuth 1.0a pair' if self.oauth1 else 'OAuth 2.0 token (no media.write: text only)'

    def h(self, **extra):
        return extra if self.oauth1 else {'Authorization': f'Bearer {self.token}', **extra}

    def refresh(self):
        r = requests.post(f'{API}/oauth2/token', data={'grant_type': 'refresh_token', 'refresh_token': self.env['X_OAUTH2_REFRESH_TOKEN'], 'client_id': self.env['X_CLIENT_ID']}, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=30)
        if r.status_code != 200: sys.exit(f'token refresh failed: HTTP {r.status_code} {r.text[:300]}')
        d = r.json(); self.token = d['access_token']
        write_env({'X_OAUTH2_ACCESS_TOKEN': d['access_token'], 'X_OAUTH2_REFRESH_TOKEN': d.get('refresh_token', self.env['X_OAUTH2_REFRESH_TOKEN'])})
        self.env = read_env(); print('token refreshed', file=sys.stderr)

    def call(self, method, url, retry=True, **kw):
        r = requests.request(method, url, headers={**self.h(), **kw.pop('headers', {})}, timeout=kw.pop('timeout', 120), auth=self.oauth1, **kw)
        if r.status_code == 401 and retry and not self.oauth1:
            self.refresh(); return self.call(method, url, retry=False, **kw)
        return r

    def whoami(self):
        r = self.call('GET', f'{API}/users/me', params={'user.fields': 'username,name'})
        if r.status_code != 200: sys.exit(f'users/me failed: HTTP {r.status_code} {r.text[:300]}')
        return r.json()['data']

    def upload_video(self, path):
        size = path.stat().st_size
        r = self.call('POST', f'{API}/media/upload/initialize', json={'media_type': 'video/mp4', 'total_bytes': size, 'media_category': 'tweet_video'}, headers={'Content-Type': 'application/json'})
        if r.status_code not in (200, 201, 202): sys.exit(f'initialize failed: HTTP {r.status_code} {r.text[:300]}')
        mid = r.json()['data']['id']
        with path.open('rb') as f:
            i = 0
            while True:
                chunk = f.read(CHUNK)
                if not chunk: break
                r = self.call('POST', f'{API}/media/upload/{mid}/append', data={'segment_index': str(i)}, files={'media': ('chunk', chunk, 'application/octet-stream')})
                if r.status_code not in (200, 201, 204): sys.exit(f'append {i} failed: HTTP {r.status_code} {r.text[:300]}')
                i += 1; print(f'uploaded {min(size, i * CHUNK) * 100 // size}%', file=sys.stderr)
        r = self.call('POST', f'{API}/media/upload/{mid}/finalize')
        if r.status_code not in (200, 201): sys.exit(f'finalize failed: HTTP {r.status_code} {r.text[:300]}')
        info = r.json().get('data', {}).get('processing_info')
        while info and info.get('state') not in ('succeeded', 'failed'):
            time.sleep(info.get('check_after_secs', 3))
            r = self.call('GET', f'{API}/media/upload', params={'media_id': mid, 'command': 'STATUS'})
            if r.status_code != 200: sys.exit(f'status failed: HTTP {r.status_code} {r.text[:300]}')
            info = r.json().get('data', {}).get('processing_info'); print('processing:', info and info.get('state'), file=sys.stderr)
        if info and info.get('state') == 'failed': sys.exit(f'media processing failed: {info}')
        return mid

    def post(self, text, media_id):
        r = self.call('POST', f'{API}/tweets', json={'text': text, 'media': {'media_ids': [media_id]}}, headers={'Content-Type': 'application/json'})
        if r.status_code not in (200, 201): sys.exit(f'post failed: HTTP {r.status_code} {r.text[:400]}')
        return r.json()['data']


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('video', nargs='?')
    ap.add_argument('--text'); ap.add_argument('--text-file')
    ap.add_argument('--post', action='store_true', help='actually upload and post (Robin\'s explicit go)')
    ap.add_argument('--whoami', action='store_true')
    a = ap.parse_args()
    x = X()
    me = x.whoami()
    if a.whoami or not a.video:
        print(f"token is @{me['username']} ({me['name']}) via {x.route}"); return
    video = Path(a.video).expanduser().resolve()
    if not video.is_file(): sys.exit(f'no such file: {video}')
    text = (Path(a.text_file).read_text().strip() if a.text_file else (a.text or '')).strip()
    if not text: sys.exit('give --text or --text-file')
    if len(text) > 280: sys.exit(f'text is {len(text)} characters; X allows 280')
    size = video.stat().st_size
    print(f"as @{me['username']} via {x.route}: {video.name} ({size / 1e6:.1f} MB)\n--- text ({len(text)} chars) ---\n{text}\n---")
    if not a.post:
        print('dry run: nothing uploaded or posted (pass --post on Robin\'s go)'); return
    if not x.oauth1: sys.exit('video needs the OAuth 1.0a pair (X_ACCESS_TOKEN / X_ACCESS_SECRET): the OAuth 2.0 token has no media.write')
    mid = x.upload_video(video)
    d = x.post(text, mid)
    url = f"https://x.com/{me['username']}/status/{d['id']}"
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open('a') as f:
        f.write(json.dumps({'time': datetime.now().astimezone().isoformat(timespec='seconds'), 'file': str(video), 'bytes': size, 'account': me['username'], 'post_id': d['id'], 'url': url, 'text': text}) + '\n')
    print(url)


if __name__ == '__main__':
    main()
