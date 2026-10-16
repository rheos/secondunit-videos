#!/usr/bin/env bash
# Spike S2 step A (throwaway, never merged). Run as root: sudo bash spike/s2/setup.sh
# Builds component 8's boundary: user agent, /home/runner 0700, mirror, locked file, OUTPUT rules, pinned CLI,
# relay and draw script, node_modules and the pinned Playwright image. No token is present in this step.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
P=${PROXY_PORT:-3128}
IMG_TAG=mcr.microsoft.com/playwright:v1.55.0-noble
IMG_DIGEST=sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29
RUNNER_UID=$(id -u runner); RUNNER_GID=$(id -g runner)
echo "runner uid:gid $RUNNER_UID:$RUNNER_GID; node: $(command -v node) $(node -v); os: $(. /etc/os-release; echo "$PRETTY_NAME")"

useradd --create-home agent
echo "agent: $(id agent)"
chmod 700 /home/runner
echo "home runner mode: $(stat -c %a /home/runner)"

# layout (components 8 and 10)
mkdir -p /srv/ar/{mv/song,mv/deps,scratch/spool/req,scratch/spool/rep,scratch/tmp,scratch/sheets,work,out}
chown "$RUNNER_UID:$RUNNER_GID" /srv/ar /srv/ar/mv /srv/ar/work /srv/ar/out /srv/ar/scratch /srv/ar/scratch/sheets
chown agent:agent /srv/ar/scratch/tmp /srv/ar/scratch/spool /srv/ar/scratch/spool/req
chown "$RUNNER_UID:$RUNNER_GID" /srv/ar/scratch/spool/rep   # the agent can read replies, never write one
chmod 755 /srv/ar /srv/ar/mv /srv/ar/scratch /srv/ar/scratch/spool /srv/ar/scratch/spool/rep
chmod 755 /srv/ar/scratch/spool/req

# mirror: a trivial song folder, editable notes.txt, locked file, bulk files for the budget probe
cat > /srv/ar/mv/song/page.html <<'HTML'
<!doctype html><meta charset="utf-8"><body style="margin:0;background:#123;color:#fff;font:bold 64px 'DejaVu Serif',serif">
<div style="padding:60px">s2 spike page<br>draft 1</div></body>
HTML
printf 'draft 1: the chorus feels late.\n' > /srv/ar/mv/song/notes.txt
printf 'locked file\n' > /srv/ar/mv/song/locked.txt
printf 'dep file\n' > /srv/ar/mv/deps/dep.txt
python3 - <<'PY'
import random
random.seed(7)
words = "amber river lantern slow chorus glass window verse bridge tempo mirror paper salt orbit hollow bright thread quiet".split()
import os
os.makedirs('/srv/ar/mv/song/bulk', exist_ok=True)
for i in range(1, 41):
    body = ' '.join(random.choice(words) for _ in range(2400))
    open(f'/srv/ar/mv/song/bulk/f{i:02d}.txt', 'w').write(body + '\n')
PY
chown -R "$RUNNER_UID:$RUNNER_GID" /srv/ar/mv
chmod -R a+rX /srv/ar/mv
chown agent:agent /srv/ar/mv/song/notes.txt
chown agent:agent /srv/ar/mv/song; chmod 1755 /srv/ar/mv/song   # the editable dir: agent-owned, sticky bit
chown root:root /srv/ar/mv/song/locked.txt; chmod 0444 /srv/ar/mv/song/locked.txt
if chattr +i /srv/ar/mv/song/locked.txt 2> /tmp/chattr.err; then echo "chattr +i: ok"; else echo "chattr +i: FAILED: $(head -1 /tmp/chattr.err)"; fi

# OUTPUT rules, inserted so the ACCEPT sits first (component 8)
iptables -I OUTPUT 1 -m owner --uid-owner agent -j REJECT
iptables -I OUTPUT 1 -m owner --uid-owner agent -o lo -p tcp -d 127.0.0.1 --dport "$P" -j ACCEPT
ip6tables -I OUTPUT 1 -m owner --uid-owner agent -j REJECT
iptables -S OUTPUT | grep -c agent | sed 's/^/iptables agent rules: /'
ip6tables -S OUTPUT | grep -c agent | sed 's/^/ip6tables agent rules: /'

# pinned CLI into /opt/ar-claude (npm ci from the lockfile)
mkdir -p /opt/ar-claude && cp "$HERE/ar-claude/package.json" "$HERE/ar-claude/package-lock.json" /opt/ar-claude/
( cd /opt/ar-claude && npm ci --no-audit --no-fund 2>&1 | tail -3 )
chmod -R a+rX /opt/ar-claude
echo "claude on disk: $(ls -l /opt/ar-claude/node_modules/.bin/claude | sed 's/^.* \([^ ]* -> .*\)$/\1/')"

# relay and draw script (root-owned, world-readable)
mkdir -p /opt/ar-tools
install -m 0755 "$HERE/relay.py" /opt/ar-tools/relay.py
install -m 0644 "$HERE/draw.mjs" /opt/ar-tools/draw.mjs

# node_modules for the render container: pinned Playwright, installed by the runner, never from the mirror
sudo -u runner npm i --prefix /srv/ar/work --ignore-scripts --no-audit --no-fund --silent playwright@1.55.0 > /dev/null 2>&1
echo "playwright module: $(node -p "require('/srv/ar/work/node_modules/playwright/package.json').version")"
chmod -R a+rX /srv/ar/work/node_modules

# pinned render image: pull by tag, then require the RepoDigest to equal the pin
docker pull -q "$IMG_TAG" > /dev/null
REPO_DIGESTS=$(docker image inspect --format '{{join .RepoDigests " "}}' "$IMG_TAG")
echo "image repo digests: $REPO_DIGESTS"
case "$REPO_DIGESTS" in *"$IMG_DIGEST"*) echo "image digest matches pin" ;; *) echo "IMAGE DIGEST MISMATCH"; exit 1 ;; esac
echo "setup done"
