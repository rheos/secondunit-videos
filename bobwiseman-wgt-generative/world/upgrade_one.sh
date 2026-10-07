#!/bin/zsh
# upgrade_one.sh <still path relative to world/> <song seconds> <interior|exterior|sky> <out name>
# Repaints one animatic still in the new cinematic style (style2/), keeping layout, story and text.
W=${0:A:h}; G=$W/..; S2=$W/style2; in=$1; t=$2; kind=$3; out=$W/keyframes_v2/$4
[[ -f $out ]] && exit 0
case $kind in
  sky) style=$W/keyframes_v2/ch10_road_through_sky.png; where="This is the sky, the escape from the ministry: open luminous blue, soft painted clouds (keep any faces, hats and signs they have), warm sunlight; no tubes, pipes, taxis, airships or machinery." ;;
  exterior) style=$S2/sky_cabs.png; where="The city around the ministry has the density and haze of image 2: vertical towers, airships and flying yellow taxis in the distance." ;;
  *) style=$S2/ministry_floor.png; where="Ministry interior: cabled walls, banks of glowing green CRT screens between the filing drawers, brass pneumatic tubes and ducts overhead, deep teal haze with warm practical lamps." ;;
esac
if (( t < 245 )); then him=$S2/plate_him_grey.png; her=$S2/plate_her_grey.png; outfit="grey (plates 5 and 6)"; else him=$S2/plate_him_colour.png; her=$S2/plate_her_colour.png; outfit="their colourful clothes (plates 7 and 8)"; fi
P="Repaint image 1 in the cinematic painted style of image 2: painted matte-painting, rich atmospheric light, painterly texture, a grown-up animated feature (not flat cartoon, not photoreal). Keep image 1's composition, the story moment, every pose and every piece of text exactly as written. $where If the man appears, draw him exactly as image 3; if the woman appears, draw her exactly as image 4; both in $outfit. Any guitar case is exactly the hard-shell case of image 5, never lumpy. Every other person is a faceless clerk with a blank head under a black hat."
[[ -n $EXTRA ]] && P="$P $EXTRA"
$G/gpt/gptimg -o $out -r $W/$in -r $style -r $him -r $her -r $S2/prop_guitar_case.png "$P" > $W/keyframes_v2/${4:r}.log 2>&1
