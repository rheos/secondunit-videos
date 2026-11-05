#!/bin/zsh
# Headless stills of the piano from a list of query strings. Usage: ./shots.sh outdir "yaw=66" "yaw=170&xr=1&labels=1" ...
# Width and height come from W and H in the environment (default 1280x900).
here=${0:A:h}; out=$1; shift; mkdir -p "$out"
g="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for v in "$@"; do
  name=${v//[&=]/_}
  nice -n 15 "$g" --headless=new --hide-scrollbars --user-data-dir="$(mktemp -d)" --force-device-scale-factor=${SCALE:-1} \
    --window-size=${W:-1280},${H:-900} --virtual-time-budget=${BUDGET:-2500} --screenshot="$out/$name.png" "file://$here/piano.html?free=1&$v" >/dev/null 2>&1
  echo "$out/$name.png"
done
