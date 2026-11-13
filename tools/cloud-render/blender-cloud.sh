#!/bin/zsh
# Render frames of a .blend on GitHub Actions (blender-render.yml): upload the .blend as a draft release asset (it can
# hold a lyric as type, so it never enters git), dispatch, wait, download the joined silent video, delete the release.
#   tools/cloud-render/blender-cloud.sh <scene.blend> <f0> <frames> <out.mp4> [slices=20] [crf=16]
# Set BR_REF=<branch> to run the workflow from a branch.
set -euo pipefail
blend=${1:?scene.blend}; f0=${2:?first frame}; frames=${3:?frame count}; out=${4:?out.mp4}; slices=${5:-20}; crf=${6:-16}
repo=rheos/secondunit-videos; ref=${BR_REF:-main}
tag="br-$(date +%Y%m%d-%H%M%S)-$RANDOM"
gh release create "$tag" -R $repo --draft --title "$tag (blender-render package, deleted after the run)" --notes "temporary" > /dev/null
trap 'gh release delete "$tag" -R $repo --yes --cleanup-tag > /dev/null 2>&1 || true' EXIT
gh release upload "$tag" -R $repo "$blend#scene.blend" > /dev/null
asset=$(gh api "repos/$repo/releases" -q ".[] | select(.tag_name == \"$tag\") | .assets[0].id")
[[ "$asset" =~ ^[0-9]+$ ]] || { echo "no asset id"; exit 1; }
before=$(gh run list -R $repo -w blender-render.yml -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || echo 0)
gh workflow run blender-render.yml -R $repo --ref "$ref" -f label="$tag" -f asset_id="$asset" -f f0="$f0" -f frames="$frames" \
  -f slices="$slices" -f crf="$crf" > /dev/null
for i in {1..30}; do
  run=$(gh run list -R $repo -w blender-render.yml -L 1 --json databaseId -q '.[0].databaseId')
  [[ "$run" != "$before" ]] && break; sleep 4
done
echo "run https://github.com/$repo/actions/runs/$run ($frames frames from $f0, $slices slices)"
gh run watch "$run" -R $repo --exit-status --interval 60 > /dev/null || { echo "run failed"; exit 1; }
tmp=$(mktemp -d); gh run download "$run" -R $repo -n film -D "$tmp"
mkdir -p "$(dirname "$out")"; mv "$tmp/film.mp4" "$out"
echo "wrote $out ($(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$out") frames)"
