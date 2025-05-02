#!/bin/bash

# Gets the name of any connected displays:
#   xrandr --query | grep " connected" | awk '{ print $1 }'

# Script to set display to 1x1 on the multiview

WIDTH=3840
HEIGHT=2160
REFRESH_RATE=30
OUTPUT="HDMI-A-0"
DISPLAY=${DISPLAY:-:0}
export DISPLAY

# Generate modeline and mode name
MODEL_LINE=$(cvt $WIDTH $HEIGHT $REFRESH_RATE | grep -oP '^Modeline\s+\K.*') || {
    echo "Failed to generate modeline"; exit 1
}
MODE_NAME=$(echo "$MODEL_LINE" | awk '{print $1}' | tr -d '"')

echo "Display: $DISPLAY"
echo "Trying mode: $MODE_NAME"

function mode_exists() {
    xrandr | grep -q "\"$MODE_NAME\""
}

function mode_attached_to_output() {
    xrandr --query | awk "/^$OUTPUT/,/^$/" | grep -q "$MODE_NAME"
}

function add_new_mode_if_needed() {
    if mode_exists; then
        echo "Mode $MODE_NAME already exists."
    else
        echo "Adding new mode: $MODE_NAME"
        xrandr --newmode $MODEL_LINE || {
            echo "Failed to add new mode"; exit 1
        }
    fi
}

function attach_mode_to_output_if_needed() {
    if mode_attached_to_output; then
        echo "Mode $MODE_NAME already attached to $OUTPUT"
    else
        echo "Attaching mode $MODE_NAME to output $OUTPUT"
        xrandr --addmode "$OUTPUT" "$MODE_NAME" || {
            echo "Failed to attach mode to output"; exit 1
        }
    fi
}

function set_mode_on_output() {
    echo "Setting mode $MODE_NAME on $OUTPUT"
    xrandr --output "$OUTPUT" --mode "$MODE_NAME" || {
        echo "Failed to set mode"; exit 1
    }
}

# Run steps
add_new_mode_if_needed
attach_mode_to_output_if_needed
set_mode_on_output

echo "Mode successfully applied."
