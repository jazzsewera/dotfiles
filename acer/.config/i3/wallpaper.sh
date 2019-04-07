#!/bin/bash

WP_DIR=/home/jazz/Pictures/Wallpapers
DESK=desktop

if [ $(( RANDOM % 4 )) -eq 1 ]
then
  feh --bg-scale $WP_DIR/$DESK/nightneoncity.jpg
  echo "nightneoncity.jpg" > cur_bg.txt
elif [ $(( RANDOM % 4 )) -eq 2 ]
then
  feh --bg-scale $WP_DIR/$DESK/neoncar.png
  echo "neoncar.png" > cur_bg.txt
elif [ $(( RANDOM % 4 )) -eq 3 ]
then
  feh --bg-scale $WP_DIR/$DESK/falltree.jpg
  echo "falltree.jpg" > cur_bg.txt
else
  feh --bg-scale $WP_DIR/$DESK/messyroom.jpg
  echo "messyroom.jpg" > cur_bg.txt
fi
