#!/bin/bash

xrandr \
  --output DVI-D-1 --auto --rotate left --pos 0x0 --set TearFree on \
  --output DisplayPort-0 --auto --rotate normal --pos 900x400 --primary --set TearFree on \
  --output DVI-D-0 --auto --rotate normal --pos 2820x400 --set TearFree on

sleep 0.3

wallschctl change &

sleep 0.3

/home/jazz/.config/polybar/launch.sh & > /dev/null
