#!/bin/zsh
# Encode a take's 180x320 frames as a Spotify Canvas: 720x1280 (x4 nearest-neighbour, hard pixel edges), 24 fps,
# H.264, no audio. Then check the loop seam: the jump from the last frame back to the first must look like an
# ordinary frame step (PSNR within 1.5 dB of the median step).
#   tools/canvas_encode.sh take-02 [song.wav song_start_s repeats]   the optional args add a review cut with the song
set -e -o pipefail
take=$1; dir=out/canvas/$take; frames=$dir/frames
[[ -d $frames ]] || { echo "no $frames"; exit 2; }
canvas=$dir/${take}_canvas_720x1280.mp4
ffmpeg -nostdin -loglevel error -y -framerate 24 -i $frames/%04d.png \
  -vf "scale=720:1280:flags=neighbor,format=yuv420p" -c:v libx264 -preset slow -crf 16 -an -movflags +faststart $canvas
echo "canvas $canvas ($(ffprobe -v error -show_entries format=duration -of csv=p=0 $canvas) s)"

# seam: PSNR of every step i -> i+1, and of last -> first
n=$(ls $frames/*.png | wc -l | tr -d ' ')
steps=()
for i in $(seq 1 $n); do
  j=$(( i % n + 1 ))
  p=$(ffmpeg -nostdin -i $frames/$(printf %04d $i).png -i $frames/$(printf %04d $j).png -lavfi psnr -f null - 2>&1 | grep -o 'average:[0-9.inf]*' | cut -d: -f2)
  steps+=($p)
done
python3 - "${steps[@]}" <<'EOF'
import sys, statistics
v = [float(x) if x != 'inf' else 99.0 for x in sys.argv[1:]]
seam, rest = v[-1], v[:-1]
med = statistics.median(rest)
print(f"steps: median {med:.2f} dB, min {min(rest):.2f}, max {max(rest):.2f}; seam (last->first) {seam:.2f} dB")
print("SEAM OK" if seam >= med - 1.5 else "SEAM VISIBLE")
EOF

if [[ -n $2 ]]; then
  song=$2; ss=$3; reps=${4:-4}
  review=$dir/${take}_review_x${reps}_song.mp4
  dur=$(( 8 * reps ))
  ffmpeg -nostdin -loglevel error -y -stream_loop $(( reps - 1 )) -i $canvas -ss $ss -t $dur -i $song \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $review
  echo "review $review"
fi
