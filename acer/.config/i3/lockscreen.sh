#!/bin/bash

WP_DIR=/home/jazz/Pictures/Wallpapers
BLUR=blurred

insidecolor=00000000
ringcolor=ffffffff
keyhlcolor=d23c3dff
bshlcolor=d23c3dff
separatorcolor=00000000
insidevercolor=00000000
insidewrongcolor=d23c3dff
ringvercolor=ffffffff
ringwrongcolor=ffffffff
verifcolor=ffffffff
timecolor=ffffffff
datecolor=ffffffff
loginbox=00000066
font="monospace"
locktext=$(date +%A),\ $(date --iso-8601=date)

i3lock \
  -t -i "$WP_DIR/$BLUR/$(cat cur_bg.txt)" \
  --timepos='x+110:h-70' \
  --datepos='x+43:h-45' \
  --clock --date-align 1 --datestr "$locktext" \
  --insidecolor=$insidecolor --ringcolor=$ringcolor --line-uses-inside \
  --keyhlcolor=$keyhlcolor --bshlcolor=$bshlcolor --separatorcolor=$separatorcolor \
  --insidevercolor=$insidevercolor --insidewrongcolor=$insidewrongcolor \
  --ringvercolor=$ringvercolor --ringwrongcolor=$ringwrongcolor --indpos='x+280:h-70' \
  --radius=20 --ring-width=4 --veriftext='' --wrongtext='' \
  --verifcolor="$verifcolor" --timecolor="$timecolor" --datecolor="$datecolor" \
  --time-font="$font" --date-font="$font" --layout-font="$font" --verif-font="$font" --wrong-font="$font" \
  --noinputtext='' --force-clock $lockargs