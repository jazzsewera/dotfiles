echo -ne "%{F#AFAFAF}蓼 "
if pactl info | grep -ie 'Default Sink' | grep -e 'alsa_output.pci-0000_00_1f.3.analog-stereo' > /dev/null || pactl info | grep -ie 'Default Sink' | grep -e 'combined' > /dev/null; then
  echo -ne "%{F#56D7FF} "
else
  if [[ $(pactl list sinks short | grep -e 'alsa_output.pci-0000_00_1f.3.analog-stereo' | grep -oE '[A-Z]+$') = "RUNNING" ]]; then
    echo -ne "%{F#AFAFAF} "
  else
    echo -ne "%{F#595959}ﯥ "
  fi
fi

if pactl info | grep -ie 'Default Sink' | grep -e 'alsa_output.usb-Creative_Technology_Ltd_Sound_Blaster_Play__3_00080951-00.analog-stereo' > /dev/null || pactl info | grep -ie 'Default Sink' | grep -e 'combined' > /dev/null; then
  echo -ne "%{F#56D7FF}"
else
  if [[ $(pactl list sinks short | grep -e 'alsa_output.usb-Creative_Technology_Ltd_Sound_Blaster_Play__3_00080951-00.analog-stereo' | grep -oE '[A-Z]+$') = "RUNNING" ]]; then
    echo -ne "%{F#AFAFAF}"
  else
    echo -ne "%{F#595959}ﳌ"
  fi
fi

echo
