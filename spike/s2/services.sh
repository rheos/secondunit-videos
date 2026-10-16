#!/usr/bin/env bash
# Spike S2 step B (throwaway): start the CONNECT proxy and the sheet worker as runner, detached. No token here.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
P=${PROXY_PORT:-3128}
: > /srv/ar/out/proxy.log; : > /srv/ar/out/worker.log
setsid nohup python3 -I "$HERE/proxy.py" "$P" "${PROXY_ALLOW:-api.anthropic.com}" /srv/ar/out/proxy.log > /srv/ar/out/proxy.stdout 2>&1 < /dev/null &
setsid nohup python3 -I "$HERE/sheet_worker.py" > /srv/ar/out/worker.stdout 2>&1 < /dev/null &
for _ in $(seq 1 40); do
  if (exec 3<> "/dev/tcp/127.0.0.1/$P") 2> /dev/null && grep -q START /srv/ar/out/proxy.log && grep -q 'worker start' /srv/ar/out/worker.log; then
    echo "services up (proxy 127.0.0.1:$P allow=${PROXY_ALLOW:-api.anthropic.com}; sheet worker)"; exit 0; fi
  sleep 0.5
done
echo "services failed to start"; cat /srv/ar/out/proxy.stdout /srv/ar/out/worker.stdout | head -5; exit 1
