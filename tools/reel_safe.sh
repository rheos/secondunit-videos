#!/usr/bin/env bash
# reel_safe.sh: re-encode a finished clip so Instagram (or a phone) damage can't run long.
#
#   tools/reel_safe.sh <in.mp4> <out.mp4> [contact-sheet.jpg]
#
# Why (rheos/secondunit-videos#493): Bob's Me and Jimi verse 3 reel froze at 23.9 s and smeared
# until 31.9 s, our file's keyframes. One bad frame smears until the next keyframe, and ours were
# up to 10 s apart, in full-range yuvj420p. This puts a keyframe every 2 s, limited (tv) range,
# AAC 48 kHz and faststart. Same size, same frames, audio not re-timed.
#
# After encoding it checks the result and exits non-zero if any check fails:
#   - decodes with no errors
#   - same width, height and video frame count as the source; durations within one frame
#   - every keyframe gap is exactly 2 s (the last GOP may be shorter)
#   - yuv420p, color_range=tv
#   - picture matches: mean, dark-end and bright-end luma within 1.5 levels of the source (a range
#     shift moves blacks and paper by ~16 levels, so it can't pass), and RGB PSNR above 25 dB as a
#     floor against a broken encode. PSNR is low-ish on grain-heavy looks (woodcut speckle changes
#     every frame, about 30 dB at the 6 Mb/s cap) and that is fine: the luma checks and the sheet
#     are what prove the picture.
# and writes a contact sheet: source on top, output below, at 10/30/50/70/90 % of the clip.
#
# Encodes run under nice -n 15 (shared Mac). Prints one TSV result line on stdout.
set -euo pipefail

in=${1:?usage: reel_safe.sh in.mp4 out.mp4 [sheet.jpg]}
out=${2:?usage: reel_safe.sh in.mp4 out.mp4 [sheet.jpg]}
sheet=${3:-${out%.*}-sheet.jpg}

probe() { ffprobe -v error -select_streams v:0 -show_entries "stream=$1" -of default=nw=1:nk=1 "$2" | head -1; }

pix=$(probe pix_fmt "$in")
range=$(probe color_range "$in")
rate=$(probe r_frame_rate "$in")
w=$(probe width "$in"); h=$(probe height "$in")
matrix=$(probe color_space "$in")
fps=$(awk -v r="$rate" 'BEGIN{split(r,a,"/"); printf "%.6f", a[1]/(a[2]?a[2]:1)}')
gop=$(awk -v f="$fps" 'BEGIN{printf "%d", f*2+0.5}')

# Full-range sources get their levels scaled into tv range; tv or untagged sources keep their
# values and are tagged tv, which is how every player already reads them.
# setparams tags every frame tv; without it an untagged source comes out untagged whatever
# -color_range says.
vf=(-vf "setparams=range=tv")
if [[ $pix == yuvj* || $range == pc ]]; then
  vf=(-vf "scale=in_range=pc:out_range=tv:flags=accurate_rnd+full_chroma_int,setparams=range=tv")
fi
# Keep the source's matrix tag so the picture decodes the same; don't invent one.
tags=()
case $matrix in bt709|bt470bg|smpte170m) tags=(-colorspace "$matrix") ;; esac

nice -n 15 ffmpeg -nostdin -hide_banner -v error -y -i "$in" \
  -map 0:v:0 -map '0:a:0?' -fps_mode passthrough \
  "${vf[@]}" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -color_range tv ${tags[@]+"${tags[@]}"} \
  -g "$gop" -keyint_min "$gop" -sc_threshold 0 -crf 20 -maxrate 6M -bufsize 12M \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart "$out"

fail=()

# 1. clean decode
errs=$(nice -n 15 ffmpeg -nostdin -hide_banner -v error -i "$out" -f null - 2>&1 | wc -l | tr -d ' ')
[[ $errs == 0 ]] || fail+=("decode-errors=$errs")

# 2. geometry, frames, duration
count() { ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of default=nw=1:nk=1 "$1"; }
fin=$(count "$in"); fout=$(count "$out")
[[ $fin == "$fout" ]] || fail+=("frames $fin->$fout")
[[ $(probe width "$out")x$(probe height "$out") == "${w}x${h}" ]] || fail+=("size changed")
vdur() { ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$1"; }
fdur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
din=$(vdur "$in"); dout=$(vdur "$out"); Din=$(fdur "$in"); Dout=$(fdur "$out")
within() { awk -v a="$1" -v b="$2" -v f="$fps" 'BEGIN{d=a-b; if(d<0)d=-d; exit !(d<=1/f+1e-6)}'; }
within "$din" "$dout" || fail+=("video-duration $din->$dout")
within "$Din" "$Dout" || fail+=("duration $Din->$Dout")

# 3. keyframe every 2 s
kf=$(ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 "$out" | tr -d ',')
gaps=$(echo "$kf" | awk 'NR>1{printf "%.3f\n", $1-p} {p=$1}')
nk=$(echo "$kf" | awk 'NF' | wc -l | tr -d ' ')
badgap=$(echo "$gaps" | awk 'NF' | sed '$d' | awk '{if ($1<1.99 || $1>2.01) n++} END{print n+0}')
maxgap=$(echo "$gaps" | awk 'NF' | sort -n | tail -1)
[[ $badgap == 0 ]] || fail+=("keyframe-gaps-off=$badgap")
awk -v m="${maxgap:-0}" 'BEGIN{exit !(m<=2.01)}' || fail+=("maxgap=$maxgap")

# 4. pixel format and range
[[ $(probe pix_fmt "$out") == yuv420p ]] || fail+=("pix_fmt")
[[ $(probe color_range "$out") == tv ]] || fail+=("color_range")

# 5. picture match. Both sides go to full-range RGB the way a player decodes them (their own
#    range and matrix tags), then compare.
psnr=$(nice -n 15 ffmpeg -nostdin -hide_banner -v info -i "$in" -i "$out" -lavfi \
  "[0:v]scale=out_range=pc,format=rgb24[a];[1:v]scale=out_range=pc,format=rgb24[b];[a][b]psnr" \
  -f null - 2>&1 | sed -n 's/.*PSNR r:[^ ]* g:[^ ]* b:[^ ]* average:\([0-9.inf]*\).*/\1/p' | tail -1)
lum() { nice -n 15 ffmpeg -nostdin -hide_banner -v error -i "$1" -vf \
  "fps=1,scale=out_range=pc,format=rgb24,format=gray,signalstats,metadata=print:file=-" -f null - 2>/dev/null |
  awk -F= '/YAVG/{a+=$2; n++} /YLOW/{l+=$2} /YHIGH/{hi+=$2} END{printf "%.2f %.2f %.2f", a/n, l/n, hi/n}'; }
read -r yin lin hin <<<"$(lum "$in")"; read -r yout lout hout <<<"$(lum "$out")"
dy=$(awk -v a="$yin" -v b="$yout" 'BEGIN{printf "%.2f", b-a}')
dl=$(awk -v a="$lin" -v b="$lout" 'BEGIN{printf "%.2f", b-a}')
dh=$(awk -v a="$hin" -v b="$hout" 'BEGIN{printf "%.2f", b-a}')
awk -v d="$dy" -v l="$dl" -v h="$dh" 'BEGIN{if(d<0)d=-d; if(l<0)l=-l; if(h<0)h=-h; exit !(d<=1.5 && l<=1.5 && h<=1.5)}' ||
  fail+=("luma-shift mean=$dy dark=$dl bright=$dh")
awk -v p="${psnr:-0}" 'BEGIN{exit !(p=="inf" || p>=25)}' || fail+=("psnr=$psnr")

# 6. contact sheet: source row over output row, 5 points
tmp=$(mktemp -d); trap 'rm -r "$tmp"' EXIT
i=0
for pct in 10 30 50 70 90; do
  t=$(awk -v d="$din" -v p=$pct 'BEGIN{printf "%.3f", d*p/100}')
  ffmpeg -nostdin -v error -ss "$t" -i "$in"  -frames:v 1 -vf "scale=out_range=pc,scale=270:-2" -y "$tmp/s$i.png"
  ffmpeg -nostdin -v error -ss "$t" -i "$out" -frames:v 1 -vf "scale=out_range=pc,scale=270:-2" -y "$tmp/o$i.png"
  i=$((i+1))
done
ffmpeg -nostdin -v error -y \
  -i "$tmp/s0.png" -i "$tmp/s1.png" -i "$tmp/s2.png" -i "$tmp/s3.png" -i "$tmp/s4.png" \
  -i "$tmp/o0.png" -i "$tmp/o1.png" -i "$tmp/o2.png" -i "$tmp/o3.png" -i "$tmp/o4.png" \
  -filter_complex "[0][1][2][3][4]hstack=5[top];[5][6][7][8][9]hstack=5[bot];[top]pad=iw:ih+6:0:0:white[t2];[t2][bot]vstack=2" \
  -q:v 3 "$sheet"

ok=PASS; ((${#fail[@]})) && ok="FAIL ${fail[*]}"
# name  result  frames  dur_in  dur_out  keyframes  maxgap  psnr  dMean  dDark  dBright  range_in  pix_in
printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
  "$(basename "$out")" "$ok" "$fout" "$Din" "$Dout" "$nk" "$maxgap" "$psnr" "$dy" "$dl" "$dh" "${range:-unknown}" "$pix"
[[ $ok == PASS ]]
