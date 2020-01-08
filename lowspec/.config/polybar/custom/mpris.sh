#!/bin/bash

# Specifying the icon(s) in the script
# This allows us to change its appearance conditionally

metadata=$(mpc current)

# Foreground color formatting tags are optional
if [[ $(mpc status | grep -o "\[[a-z]*\]") = "[playing]" ]]; then
    echo "%{F#D08770}$metadata"       # Orange when playing
elif [[ $(mpc status | grep -o "\[[a-z]*\]") = "[paused]" ]]; then
    echo "%{F#65737E}$metadata"       # Greyed out info when paused
else
    echo "%{F#65737E}The playback is stopped."                 # Greyed out icon when stopped
fi
