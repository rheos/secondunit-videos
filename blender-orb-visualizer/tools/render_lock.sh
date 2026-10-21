#!/bin/bash
# One headless Blender at a time on this Mac (parallel act builders share it; two EEVEE renders at once have crashed
# the machine). Usage: tools/render_lock.sh blender -b --factory-startup --python act.py -- --stills 600,700
# Waits (up to 15 min) for the lock dir, runs the command niced, releases the lock on exit.
LOCK="${TMPDIR:-/tmp}/respawn-render.lock"
waited=0
while ! mkdir "$LOCK" 2>/dev/null; do
  if [ -f "$LOCK/pid" ] && ! kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then rm -rf "$LOCK"; continue; fi
  sleep 3; waited=$((waited + 3))
  if [ "$waited" -ge 900 ]; then echo "render_lock: gave up after 15 min" >&2; exit 75; fi
done
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT
nice -n 15 "$@"
