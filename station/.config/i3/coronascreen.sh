#!/bin/bash

xrandr \
  --output DVI-D-1 --off \
  --output DisplayPort-0 --auto --rotate normal --pos 900x200 --primary --set TearFree on \
  --output HDMI-A-0 --auto --rotate left --pos 0x0 --set TearFree on \
  --output DVI-D-0 --off

sleep 0.3

wallschctl change &

sleep 0.3

/home/jazz/.config/polybar/launch.sh & > /dev/null
