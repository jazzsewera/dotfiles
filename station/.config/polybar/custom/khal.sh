#!/bin/bash

# First, install khal `sudo pacman -S khal`
EVENT_MESSAGE=""
NO_EVENT_MESSAGE=""
EVENT_TOMORROW_MESSAGE=""
NO_EVENT_TOMORROW_MESSAGE=""

if [[ $(khal --no-color list today) != "No events" ]]; then
  echo -n $EVENT_MESSAGE;
else
  echo -n $NO_EVENT_MESSAGE;
fi

if [[ $(khal --no-color list tomorrow) != "No events" ]]; then
  echo -n $EVENT_TOMORROW_MESSAGE;
else
  echo -n $NO_EVENT_TOMORROW_MESSAGE;
fi

