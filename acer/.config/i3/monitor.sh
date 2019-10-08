#!/bin/bash

xrandr \
  --output eDP1 --off \
  --output HDMI1 --mode 1600x900 --rotate left --pos 0x0 \
  --output DP2-1 --mode 1920x1200 --rotate normal --pos 900x400 --primary \
  --output DP2-2 --mode 1920x1200 --rotate normal --pos 2820x400

sleep 0.3

wallschctl change &

sleep 0.5

/home/jazz/.config/polybar/launch.sh & > /dev/null
