#!/bin/zsh
# Render a look on GitHub Actions in parallel and bring back one video with the song on it.
#
#   tools/cloud-render/cloud-render.sh [--draft] [--tall] <project> <page> <t0> <t1> [out.mp4] [slices=20] [height=720]
#   --draft (or CR_DRAFT=1): review quality: slices at crf 26, joined on GitHub by stream copy (no second encode,
#   smallest download). Masters (no flag): crf 18, joined with the concat filter at preset medium.
#   --tall (or CR_TALL=1): a 9:16 page, always 720x1280 at crf 23 capped at 4.5 Mbit/s, the house phone-ratio
#   encode for drafts and finals alike (secondunit/CLAUDE.md), so --draft changes nothing there. No height argument.
#   Either way GitHub joins the slices and the Mac downloads one file and only muxes the song (stream copy).
#   CR_REF=<branch> runs the workflow file from that branch (to test workflow changes before merging).
#   e.g. tools/cloud-render/cloud-render.sh bobwiseman-holiday-tavern looks/charcoal.html 24 130
#   HyperFrames compositions (the IndieAgent explainers) go through unchanged: render-slice.mjs injects HyperFrames'
#   own runtime when a page has no __frameJPEG, and the sound is the composition's one <audio> clip (offsets and
#   volume applied, hfaudio.py) unless the project has an assets/song.wav. t0/t1 are composition seconds.
#   e.g. tools/cloud-render/cloud-render.sh --draft indieagent-gigcaravan index.html 0 90
#
# 0. Warns when the page draws in a font the runner lacks (fontcheck.py), since that frame will not match.
# 1. Packages the project's code and assets (never audio, video, source/, _in/, out/, work/) and uploads it
#    as a DRAFT release asset, because page code can quote lyrics and lyrics stay out of git.
# 2. Starts .github/workflows/cloud-render.yml: N runners each draw their frames and encode a silent slice.
# 3. The workflow's join job checks each slice's frame count and joins them with the concat filter; this Mac
#    downloads that one video and muxes the project's assets/song.wav for t0..t1 onto it (video copied, no encode).
# 4. Runs badframes, then deletes the release. Uses about 3 Actions minutes per slice.
set -e -o pipefail
draft=${CR_DRAFT:-0}; tall=${CR_TALL:-0}
while [[ $1 == --(draft|tall) ]]; do [[ $1 == --draft ]] && draft=1 || tall=1; shift; done
(( draft )) && crf=26 || crf=18
REPO=rheos/secondunit-videos
here=${0:A:h}; root=${here:h:h}
proj=$1; page=$2; t0=$3; t1=$4; slices=${6:-20}; height=${7:-720}
[[ -n $proj && -n $page && -n $t0 && -n $t1 ]] || { sed -n '2,8p' $0; exit 2; }
pdir=$root/$proj; [[ -f $pdir/$page ]] || { echo "no page $pdir/$page"; exit 2; }
song=$pdir/assets/song.wav; hfclip=()
if [[ ! -f $song ]] && grep -q 'data-composition-id' $pdir/$page; then
  # a HyperFrames composition carries its sound as an <audio> clip: src start media-start duration volume
  hfclip=($(python3 $here/hfaudio.py $pdir/$page)) || { echo "no $song, and no single <audio> clip in the page to use"; exit 2; }
  song=$pdir/${hfclip[1]}
fi
[[ -f $song ]] || { echo "no $song (the song clock)"; exit 2; }
fps=24; width=$(( height * 16 / 9 )); vbv=()
if (( tall )); then
  [[ -z $7 ]] || { echo "--tall is always 720x1280: drop the height argument"; exit 2; }
  width=720; height=1280; crf=23; vbv=(-f maxrate=4500)   # kbit/s; the workflow sets bufsize to twice it
fi
frames=$(python3 -c "print(round(($t1 - $t0) * $fps))")
[[ $slices == <-> ]] || { echo "slices must be a whole number"; exit 2; }
max=$(( frames < 20 ? frames : 20 ))
(( frames > 0 && slices >= 1 && slices <= max )) || { echo "need t1 > t0 and 1 <= slices <= $max"; exit 2; }
# the frame scanner needs numpy: $PY, else the ViralVision venv, else python3 if it has numpy
py=${PY:-~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python}
[[ -x $py ]] || py=python3
$py -c 'import numpy' 2>/dev/null || { echo "no python with numpy for the frame scan (set PY=...)"; exit 2; }
slug=${${page:t}:r}
out=${5:-$pdir/out/${slug}_cloud_${t0}-${t1}.mp4}
label="${proj}-${slug}-$(date +%Y%m%d-%H%M%S)"
tmp=$(mktemp -d); trap 'rm -rf $tmp' EXIT
if (( ${#hfclip} )); then
  # put the clip on the composition clock: from its media-start, delayed to its start, at its volume
  ms=$(python3 -c "print(round(${hfclip[2]} * 1000))"); lim=(); [[ ${hfclip[4]} == - ]] || lim=(-t ${hfclip[4]})
  ffmpeg -v error -ss ${hfclip[3]} $lim -i $song -af "adelay=${ms}:all=1,volume=${hfclip[5]}" $tmp/song.wav
  echo "sound: ${hfclip[1]} from ${hfclip[2]} s (media from ${hfclip[3]} s)"; song=$tmp/song.wav
fi
echo "== $label: $frames frames in $slices slices at ${width}x${height}$( (( draft )) && echo ", draft")"
# fonts: the runner has the Microsoft core fonts but no Mac-only faces (Futura, Helvetica Neue, ~/Library/Fonts)
python3 $here/fontcheck.py $pdir $page || echo "font check failed; carrying on without it"

# 1. package: an ALLOWLIST of code, styles, data, images and fonts, never audio, video, secrets or data folders
(cd $pdir && find . \( -path ./out -o -path ./source -o -path ./_in -o -path ./work -o -path ./tmp -o -path ./output \
    -o -path ./node_modules -o -path ./.git \) -prune -o -type f \( -iname '*.html' -o -iname '*.js' -o -iname '*.mjs' \
    -o -iname '*.css' -o -iname '*.json' -o -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \
    -o -iname '*.gif' -o -iname '*.svg' -o -iname '*.woff' -o -iname '*.woff2' -o -iname '*.ttf' -o -iname '*.otf' \) \
    ! -name 'package-lock.json' -print) | sort > $tmp/list
tar czf $tmp/pkg.tgz -C $pdir -T $tmp/list
# belt and braces: refuse if anything outside the allowlist got in
tar tzf $tmp/pkg.tgz | grep -viE '/$|\.(html|m?js|css|json|png|jpe?g|webp|gif|svg|woff2?|ttf|otf)$' && { echo "refusing: unexpected files in package"; exit 1; }
echo "package $(du -h $tmp/pkg.tgz | cut -f1)"
tag="cr-$label"
# Every gh call below crosses a home connection, so a failed call is a retry, not the end of the render. Once the
# workflow is started the script only gives up when the run has finished or failed; if it dies anyway (Ctrl-C, or
# GitHub unreachable for half an hour) the EXIT trap cancels the run BEFORE deleting the package it is reading.
retry() { local n=$1 i; shift; for i in {1..$n}; do "$@" && return 0; (( i < n )) && sleep $(( i * 5 )); done; return 1; }
release_id() { gh api --paginate repos/$REPO/releases --jq ".[] | select(.tag_name==\"$tag\") | .id" | head -1; }
cleanup_release() {
  local rid
  for try in 1 2 3 4; do
    rid=$(release_id 2>/dev/null) || rid="?"
    [[ -z $rid ]] && { echo "package release deleted"; return 0; }
    [[ $rid != "?" ]] && gh api -X DELETE repos/$REPO/releases/$rid > /dev/null 2>&1
    sleep 3
  done
  echo "WARNING: could not delete draft release $tag. Delete it by hand: https://github.com/$REPO/releases"
}
find_run() { gh run list --repo $REPO --workflow cloud-render.yml ${CR_REF:+--branch=$CR_REF} --limit 20 --json databaseId,displayTitle \
  --jq "[.[] | select(.displayTitle==\"cloud-render $label\") | .databaseId][0] // empty"; }
dispatched=0; run=""; run_done=0
cancel_run() {
  (( dispatched && ! run_done )) || return 0
  [[ -n $run ]] || run=$(retry 3 find_run 2>/dev/null) || run=""
  [[ -n $run ]] || { echo "WARNING: the workflow was started but its run was not found; cancel it by hand: https://github.com/$REPO/actions"; return 0; }
  retry 4 gh run cancel $run --repo $REPO > /dev/null 2>&1 && echo "cancelled run $run" \
    || echo "WARNING: could not cancel run $run: https://github.com/$REPO/actions/runs/$run"
}
trap 'set +e; cancel_run; cleanup_release; rm -rf $tmp' EXIT
trap 'exit 130' INT TERM HUP
# a lost reply can hide a release that was made: clear it before trying again
for try in 1 2 3; do
  gh release create $tag --repo $REPO --draft --title "tmp cloud-render $label (deleted after the run)" \
    --notes "Temporary package for tools/cloud-render. Deleted when the render is done." $tmp/pkg.tgz > /dev/null && break
  (( try < 3 )) || { echo "could not upload the package"; exit 1; }
  cleanup_release; sleep 10
done
asset_id() { gh api --paginate repos/$REPO/releases --jq ".[] | select(.tag_name==\"$tag\") | .assets[0].id" | head -1; }
asset=$(retry 4 asset_id) || asset=""
[[ -n $asset ]] || { echo "release asset not found"; exit 1; }

# 2. run
dispatched=1
for try in 1 2 3; do
  gh workflow run cloud-render.yml --repo $REPO ${CR_REF:+--ref=$CR_REF} -f crf=$crf -f label=$label -f asset_id=$asset -f page=$page -f t0=$t0 \
    -f frames=$frames -f slices=$slices -f fps=$fps -f width=$width -f height=$height $vbv && break
  # the dispatch may have landed even though its reply was lost: look for the run before sending another
  for i in {1..6}; do sleep 5; run=$(find_run 2>/dev/null) || run=""; [[ -n $run ]] && break; done
  [[ -n $run ]] && break
  (( try < 3 )) || { echo "could not start the workflow"; exit 1; }
done
for i in {1..45}; do
  [[ -n $run ]] && break
  run=$(find_run 2>/dev/null) || run=""
  [[ -n $run ]] || sleep 2
done
[[ -n $run ]] || { echo "run did not start"; exit 1; }
echo "run https://github.com/$REPO/actions/runs/$run"
t_start=$(date +%s)
# poll rather than gh run watch: watch exits non-zero on a dropped connection exactly as it does on a failed run
lost=0; st=""
while :; do
  sleep 15
  st=$(gh run view $run --repo $REPO --json status,conclusion --jq '.status + " " + .conclusion' 2>/dev/null) || st=""
  if [[ -z $st ]]; then
    (( ++lost <= 120 )) || { echo "GitHub unreachable for 30 min"; exit 1; }
    (( lost % 4 )) || echo "still trying to reach GitHub ($(( lost / 4 )) min)"
    continue
  fi
  lost=0
  [[ $st == completed* ]] && break
done
run_done=1
[[ $st == "completed success" ]] || { echo "run FAILED (${st#completed })"; retry 3 gh run view $run --repo $REPO --log-failed | tail -20 || true; exit 1; }
echo "rendered in $(( $(date +%s) - t_start )) s"

# 3. download the ONE joined video (the workflow's join job checked every slice's frame count), mux the song
#    with the video stream copied: no encode on the Mac
t_dl=$(date +%s)
for try in {1..8}; do
  rm -rf $tmp/film
  gh run download $run --repo $REPO -n film -D $tmp/film > /dev/null 2>&1 && break
  sleep $(( try * 5 ))
done
[[ -f $tmp/film/film.mp4 ]] || { echo "could not download the joined film; it stays on the run for 2 days:"
  echo "  gh run download $run --repo $REPO -n film"; exit 1; }
echo "downloaded $(du -h $tmp/film/film.mp4 | cut -f1) in $(( $(date +%s) - t_dl )) s"
mkdir -p ${out:h}
ffmpeg -y -loglevel error -i $tmp/film/film.mp4 -ss $t0 -t $(( t1 - t0 )) -i $song -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -t $(( t1 - t0 )) -movflags +faststart $out
got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $out | tr -d ',')
(( got == frames )) || { echo "video has $got frames, want $frames"; exit 1; }

# 4. scan
$py $here/badframes.py $out
echo "wrote $out"
