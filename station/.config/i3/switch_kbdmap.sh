#!/bin/bash

if [ $(setxkbmap -query | grep -iwoE "[A-Za-z]{2}$") == 'pl' ]; then
	setxkbmap us
else
	setxkbmap pl
fi
