#!/bin/bash

WP_DIR=/home/jazz/Pictures/Wallpapers
DESK=desktop

BG_LIST=($WP_DIR/$DESK/*)
N=${#BG_LIST[@]}
((N=RANDOM%N))
RAND_BG=$(basename ${BG_LIST[$N]})

echo $RAND_BG > cur_bg.txt
feh --bg-scale $WP_DIR/$DESK/$RAND_BG
