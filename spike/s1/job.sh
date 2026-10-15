#!/usr/bin/env bash
# Spike S1 job (throwaway). MODE: check | stills | ref | perf. Prints counts and sha-named paths only.
set -euo pipefail
MODE=$1
TAG=mcr.microsoft.com/playwright:v1.55.0-noble
W=/srv/ar/work
OUT=$RUNNER_TEMP/out; IN=$RUNNER_TEMP/in; PKG=$RUNNER_TEMP/pkg
mkdir -p "$OUT" "$IN" "$PKG"
echo "cores: $(nproc)"

gh api -H "Accept: application/octet-stream" "repos/$REPO/releases/assets/$PAGE_ASSET" > "$IN/page.tgz"
tar xzf "$IN/page.tgz" --warning=no-unknown-keyword -C "$PKG"; rm "$IN/page.tgz"
echo "page files: $(find "$PKG" -type f | wc -l)"
docker pull -q "$TAG" > /dev/null
DIGEST=$(docker image inspect --format '{{index .RepoDigests 0}}' "$TAG"); IMG=$DIGEST
echo "image: $DIGEST"
npm i --prefix tools/motion-lab --no-save --no-audit --no-fund --silent playwright@1.55.0 > /dev/null 2>&1
echo "playwright module: $(node -p "require('./tools/motion-lab/node_modules/playwright/package.json').version")"

FONTARGS=()
if [[ $MODE != ref ]]; then
  sudo mkdir -p "$W/fonts"; sudo chown -R "$(id -u):$(id -g)" "$W"; chmod 700 "$W/fonts"
  gh api -H "Accept: application/octet-stream" "repos/$REPO/releases/assets/$FONT_ASSET" > "$IN/f.tar"
  tar xf "$IN/f.tar" --warning=no-unknown-keyword -C "$W/fonts"; rm "$IN/f.tar"
  n=0
  for f in "$W"/fonts/*; do b=$(basename "$f")
    [[ "$(sha256sum "$f" | cut -c1-64)" == "${b%.*}" ]] || { echo "sha mismatch: $b"; exit 1; }; n=$((n + 1)); done
  echo "fonts installed: $n (sha256 verified)"
  cat > "$W/fonts.conf" <<CONF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>$W/fonts</dir>
  <cachedir>/tmp/fontconfig</cachedir>
</fontconfig>
CONF
  FONTSET=$(ls "$W/fonts" | sort | sha256sum | cut -c1-64)
  FONTARGS=(-v "$W/fonts:$W/fonts:ro" -v "$W/fonts.conf:/etc/ar/fonts.conf:ro" -e FONTCONFIG_FILE=/etc/ar/fonts.conf)
else
  FONTSET=image-fonts
fi
echo "platform id: $(printf '%s %s' "$DIGEST" "$FONTSET" | sha256sum | cut -c1-16) (fontset ${FONTSET:0:16})"

RUN=(docker run --rm --network none --cpus 2 --shm-size 1g --user "$(id -u):$(id -g)" --cap-drop ALL
  --security-opt no-new-privileges -e HOME=/tmp "${FONTARGS[@]}"
  -v "$GITHUB_WORKSPACE/tools/motion-lab:/src/motion-lab:ro" -v "$GITHUB_WORKSPACE/spike/s1:/src/s1:ro"
  -v "$PKG:/pkg:ro" -v "$OUT:/out" -w /pkg "$IMG")

if [[ $MODE != ref ]]; then
  # installed-set check: fc-list inside the container must list exactly the installed files
  if "${RUN[@]}" sh -c 'command -v fc-list' > /dev/null 2>&1; then
    echo "fc-list in image: yes"
    "${RUN[@]}" fc-list --format '%{file}\n' | sort -u > "$IN/listed"
  else
    echo "fc-list in image: NO (host fallback)"
    FONTCONFIG_FILE="$W/fonts.conf" fc-list --format '%{file}\n' | sort -u > "$IN/listed"
  fi
  ls -1 "$W"/fonts/* | sort -u > "$IN/want"
  extra=$(comm -13 "$IN/want" "$IN/listed" | wc -l); missing=$(comm -23 "$IN/want" "$IN/listed" | wc -l)
  echo "installed-set check: want $(wc -l < "$IN/want"), listed $(wc -l < "$IN/listed"), extra $extra, missing $missing"
  if (( extra == 0 && missing == 0 )); then echo "installed-set check: PASS"; else echo "installed-set check: FAIL"; exit 1; fi
fi

case $MODE in
  check) ;;
  stills|ref) "${RUN[@]}" node /src/s1/draw.mjs stills /src/s1/stills.json
    echo "stills written: $(ls "$OUT"/*.jpg | wc -l)" ;;
  perf) "${RUN[@]}" node /src/s1/draw.mjs perf /src/s1/perf.json ;;
esac
