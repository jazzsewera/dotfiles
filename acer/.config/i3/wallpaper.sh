#!/bin/bash

if [ $(( $(date --date=now +%d) % 3 )) -eq 1 ]
then
  feh --bg-scale /home/jazz/Pictures/Wallpapers/nightneoncity.jpg
elif [ $(( $(date --date=now +%d) % 3 )) -eq 2 ]
then
  feh --bg-scale /home/jazz/Pictures/Wallpapers/neoncar.png
else
  feh --bg-scale /home/jazz/Pictures/Wallpapers/messyroom.jpg
fi
