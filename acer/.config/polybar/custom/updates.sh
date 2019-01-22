#!/bin/bash

# Simple script to indicate updates in polybar
# Uses checkupdates Arch Linux script
# but can be altered to be used with any other
# script outputting nothing when there are no
# available updates and failing when there's
# no connection

output=$(checkupdates 2>/dev/null)
e_status=$?

if [[ "$e_status" -eq "0" ]]; then
  if [[ -z $output ]]; then
    echo -e "%{F#8AA881}"
  else
    echo -e "%{F#56D7FF}"
  fi
else
  echo -e "%{F#494949}"
fi

