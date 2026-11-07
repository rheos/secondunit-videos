#!/bin/zsh
# whole-film render: one scene per clip window, four at a time, joined by stream copy, then sound and VFX on the song
set -o pipefail
W=/Users/robin/Code/novadiem/indieagent/secondunit/_wt-noimage; PF=$W/bobwiseman-swift-noimage; P=$PF/work/ihd; cd $P || exit 1
export PATH=/usr/local/opt/ruby/bin:$PATH
until mkdir /Users/robin/tmp/devweb-heavy.lock 2>/dev/null; do sleep 8; done
echo 'swift ihd film render' > /Users/robin/tmp/devweb-heavy.lock/owner
trap 'rm -rf /Users/robin/tmp/devweb-heavy.lock' EXIT
BIN=tools/graphics/.build/release/mgraphics
EDGES=(0 17 44.9 75.3 106.9 137.3 162.8 190.9 216.9 248.4 282 300.04)
mkdir -p output/film; rm -f output/film/sec_*.mp4(N) scenes/film_*.json(N)
old=(output/film/sec_*.mp4(N)); (( ${#old} == 0 )) || { echo "old sections still there"; exit 1; }
SECONDS=0
one() {
  local i=$1 a=$2 b=$3 tag=$(printf %02d $i)
  local F=$(python3 -c "print(round($a*24))") T=$(python3 -c "print(round($b*24))")
  nice -n 15 ruby ../../scene/ihd_film.rb $a $b scenes/film_$tag.json >/dev/null || { echo FAIL scene $tag; return 1; }
  nice -n 15 $BIN scenes/film_$tag.json --out output/film/sec_$tag.mp4 --width 1080 --height 1920 --fps 24 --frames 7201 --from $F --to $T --bitrate 20000000 2>&1 | tail -1 | cut -c1-90
  rm -f scenes/film_$tag.json
}
n=$(( ${#EDGES} - 1 ))
for i in {1..$n}; do
  one $i $EDGES[$i] $EDGES[$((i+1))] &
  if (( i % 4 == 0 )); then wait; fi
done
wait
echo "rendered in $SECONDS s"
for i in {1..$n}; do
  tag=$(printf %02d $i)
  [ -s output/film/sec_$tag.mp4 ] || { echo MISSING $tag; exit 2; }
  print "file 'sec_$tag.mp4'"
  ffprobe -v error -select_streams v -count_packets -show_entries stream=nb_read_packets -of csv=p=0 output/film/sec_$tag.mp4 >&2
done > output/film/list.txt
ffmpeg -y -v error -f concat -safe 0 -i output/film/list.txt -i ../ihd-in/song.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest output/ihd-film_clean.mp4 || exit 3
C=output/ihd-film_clean.mp4
NOPAINT=1 EVENTS=1 ruby ../../scene/ihd_film.rb 0 300.04 /tmp/_x.json >/dev/null 2>&1 || NOPAINT=1 EVENTS=1 ruby ../../scene/ihd_film.rb 0 300.04 scenes/_x.json >/dev/null
rm -f scenes/_x.json
ruby ../../scene/ihd_film_finish.rb $C scenes/film.events.json || exit 4
SFX=finish-sfx nice -n 15 ruby mv.rb --project $P sfx:gen >/dev/null 2>&1
ruby ../../scene/ihd_film_finish.rb $C scenes/film.events.json >/dev/null
rm -f output/ihd-film_clean_sfx.mp4 output/ihd-film_clean_finished.mp4; rm -rf output/ihd-film_clean_finished.mp4.parts
SFX=finish-sfx nice -n 15 ruby mv.rb --project $P sfx:mix 2>&1 | tail -1 | cut -c1-120
JOBS=1 VFX=finish-vfx nice -n 15 ruby mv.rb --project $P vfx:render 2>&1 | tail -1 | cut -c1-160
ls -la output/ihd-film_clean_finished.mp4
ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames,duration -of csv=p=0 output/ihd-film_clean_finished.mp4
echo "total $SECONDS s"
