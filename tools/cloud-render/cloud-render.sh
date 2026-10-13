#!/bin/zsh
# Render a look on GitHub Actions in parallel and bring back one video with the song on it.
#
#   tools/cloud-render/cloud-render.sh [--draft] <project> <page> <t0> <t1> [out.mp4] [slices=20] [height=720]
#   --draft (or CR_DRAFT=1): review quality, crf 23 and a veryfast join on GitHub. Masters (no flag): crf 18 / medium.
#   Either way GitHub joins the slices and the Mac downloads one file and only muxes the song (stream copy).
#   CR_REF=<branch> runs the workflow file from that branch (to test workflow changes before merging).
#   e.g. tools/cloud-render/cloud-render.sh bobwiseman-holiday-tavern looks/charcoal.html 24 130
#
# 1. Packages the project's code and assets (never audio, video, source/, _in/, out/, work/) and uploads it
#    as a DRAFT release asset, because page code can quote lyrics and lyrics stay out of git.
# 2. Starts .github/workflows/cloud-render.yml: N runners each draw their frames and encode a silent slice.
# 3. The workflow's join job checks each slice's frame count and joins them with the concat filter; this Mac
#    downloads that one video and muxes the project's assets/song.wav for t0..t1 onto it (video copied, no encode).
# 4. Runs badframes, then deletes the release. Uses about 3 Actions minutes per slice.
set -e -o pipefail
draft=${CR_DRAFT:-0}; [[ $1 == --draft ]] && { draft=1; shift; }
(( draft )) && crf=23 || crf=18
REPO=rheos/secondunit-videos
here=${0:A:h}; root=${here:h:h}
proj=$1; page=$2; t0=$3; t1=$4; slices=${6:-20}; height=${7:-720}
[[ -n $proj && -n $page && -n $t0 && -n $t1 ]] || { sed -n '2,6p' $0; exit 2; }
pdir=$root/$proj; [[ -f $pdir/$page ]] || { echo "no page $pdir/$page"; exit 2; }
song=$pdir/assets/song.wav; [[ -f $song ]] || { echo "no $song (the song clock)"; exit 2; }
fps=24; width=$(( height * 16 / 9 ))
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
echo "== $label: $frames frames in $slices slices at ${width}x${height}$( (( draft )) && echo ", draft")"

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
gh release create $tag --repo $REPO --draft --title "tmp cloud-render $label (deleted after the run)" \
  --notes "Temporary package for tools/cloud-render. Deleted when the render is done." $tmp/pkg.tgz > /dev/null
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
trap 'cleanup_release; rm -rf $tmp' EXIT
asset=$(gh api --paginate repos/$REPO/releases --jq ".[] | select(.tag_name==\"$tag\") | .assets[0].id" | head -1)
[[ -n $asset ]] || { echo "release asset not found"; exit 1; }

# 2. run
gh workflow run cloud-render.yml --repo $REPO ${CR_REF:+--ref=$CR_REF} -f crf=$crf -f label=$label -f asset_id=$asset -f page=$page -f t0=$t0 \
  -f frames=$frames -f slices=$slices -f fps=$fps -f width=$width -f height=$height
run=""
for i in {1..30}; do
  run=$(gh run list --repo $REPO --workflow cloud-render.yml --limit 10 --json databaseId,displayTitle \
    --jq ".[] | select(.displayTitle==\"cloud-render $label\") | .databaseId" | head -1)
  [[ -n $run ]] && break; sleep 2
done
[[ -n $run ]] || { echo "run did not start"; exit 1; }
echo "run https://github.com/$REPO/actions/runs/$run"
t_start=$(date +%s)
gh run watch $run --repo $REPO --exit-status --interval 15 > /dev/null || { echo "run FAILED"; gh run view $run --repo $REPO --log-failed | tail -20; exit 1; }
echo "rendered in $(( $(date +%s) - t_start )) s"

# 3. download the ONE joined video (the workflow's join job checked every slice's frame count), mux the song
#    with the video stream copied: no encode on the Mac
t_dl=$(date +%s)
for try in 1 2 3 4 5; do gh run download $run --repo $REPO -n film -D $tmp/film > /dev/null 2>&1 && break; sleep 5; done
[[ -f $tmp/film/film.mp4 ]] || { echo "could not download the joined film"; exit 1; }
echo "downloaded $(du -h $tmp/film/film.mp4 | cut -f1) in $(( $(date +%s) - t_dl )) s"
mkdir -p ${out:h}
ffmpeg -y -loglevel error -i $tmp/film/film.mp4 -ss $t0 -t $(( t1 - t0 )) -i $song -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -t $(( t1 - t0 )) -movflags +faststart $out
got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $out | tr -d ',')
(( got == frames )) || { echo "video has $got frames, want $frames"; exit 1; }

# 4. scan
$py $here/badframes.py $out
echo "wrote $out"
