#!/bin/zsh
# new_beat.sh <out name> <interior|sky|exterior> <grey|colour> "<scene>"
# Paints a new beat straight in the new style (style2/) with the plates and the case prop sheet.
W=${0:A:h}; G=$W/..; S2=$W/style2; out=$W/keyframes_v2/$1
[[ -f $out ]] && exit 0
case $2 in sky) style=$W/keyframes_v2/ch10_road_through_sky.png;; exterior) style=$S2/sky_cabs.png;; *) style=$S2/ministry_floor.png;; esac
if [[ $3 == colour ]]; then him=$S2/plate_him_colour.png; her=$S2/plate_her_colour.png; else him=$S2/plate_him_grey.png; her=$S2/plate_her_grey.png; fi
P="$4 Painted in the cinematic style of image 1: painted matte-painting, rich atmospheric light, painterly texture, a grown-up animated feature (not flat cartoon, not photoreal). If the man appears, draw him exactly as image 2; if the woman appears, draw her exactly as image 3. Any guitar case is exactly the hard-shell case of image 4. Every other person is a faceless clerk with a blank head under a black hat. Ministry interiors have cabled walls, green CRT screens, filing drawers, brass pneumatic tubes and ducts; the sky never has any machinery."
$G/gpt/gptimg -o $out -r $style -r $him -r $her -r $S2/prop_guitar_case.png "$P" > $W/keyframes_v2/${1:r}.log 2>&1
