#!/bin/zsh
# Links the 1080p page frames of TV news v3 onto the song grid in work/finals/wide/<frame>.jpg
set -e -o pipefail
O=out; W=work/finals/wide; rm -rf $W; mkdir -p $W
L() { local dir=$1 s0=$2 a=$3 b=$4; for ((f=a; f<b; f++)); do src=$dir/f_$(printf %06d $((f-s0))).jpg; [[ -f $src ]] || { echo missing $src; exit 1; }; ln -f $src $W/$(printf %06d $f).jpg; done; }
L $O/frames_looks_tv_r3a_bv_html_0_95.91666666666667 0 0 634
L $O/frames_looks_tv_r3a_bv_html_22_29.5 528 634 682
L $O/frames_looks_tv_r3a_bv_html_0_95.91666666666667 0 682 2302
L $O/frames_looks_tv_r3b_html_95.91666666666667_240.91666666666666 2302 2302 5782
L $O/frames_looks_tv_html_240.91666666666666_261.5 5782 5782 6276
L $O/frames_looks_tv_r3c_bv_html_261.5_340.4583333333333 6276 6276 8171
n=$(ls $W | wc -l | tr -d ' '); echo "$n frames"; [[ $n == 8171 ]]
