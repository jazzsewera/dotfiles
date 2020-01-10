#!/bin/bash

xrandr \
  --output DVI-D-1 --auto --rotate left --pos 0x0 \
  --output DisplayPort-0 --auto --rotate normal --pos 900x400 --primary \
  --output DVI-D-0 --auto --rotate normal --pos 2820x400

wallschd &

lockscreen /home/jazz/Pictures/Wallpapers/multihead/blurred/night/night_wh_cityscape_san_francisco.jpg
