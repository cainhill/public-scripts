#!/usr/bin/env python3
import sys
import os
import subprocess
import json
import time
import syslog

# Decide timeout
timeout_seconds = 2 * 60

# Find out which keyboard called this function
origin_keyboard = sys.argv[1]

# Set locations needed for this script
script_path = os.path.abspath(__file__)
script_dir = os.path.dirname(script_path)
state_path = f"{script_dir}/layout_state.json"

# Make it easier to send the IR codes 
def send_ir_code(device_action):  # Fixed: renamed function to match usage
    subprocess.run([
        "bash",
        f"{script_dir}/devices/broadLink/sendCommand.sh",
        f"{script_dir}/devices/broadLink/codes/{device_action}"
    ], check=True)
	
# Get the last known layout and time
state = {"last_layout": 1, "last_time": 0}
if os.path.exists(state_path):
    with open(state_path, "r") as f:
        state = json.load(f)

# Extract variables from state
last_layout = state.get("last_layout", 1)
last_time = state.get("last_time", 0)
 
# Get the current time for comparison
now = time.time()
	
# Determine the next layout
next_layout = last_layout + 1
if (now - last_time) > timeout_seconds or last_layout == 3:
    next_layout = 1
	
# Log progress
syslog.syslog(syslog.LOG_INFO, f"Sideby [applyNextLayout] Applying the next layout. (next_layout: {next_layout}, origin_keyboard: {origin_keyboard})")

# Apply the appropriate layout
if next_layout == 1:
    send_ir_code("multiviewer/1")
    send_ir_code("keyboard-a-switch/1")
    send_ir_code("keyboard-b-switch/1")
    send_ir_code("pc/display-full")
elif next_layout == 2:
    send_ir_code("multiviewer/1&2")
    send_ir_code("pc/display-half")
    if origin_keyboard == "keyboard-a":
        send_ir_code("keyboard-a-switch/2")
    if origin_keyboard == "keyboard-b":
        send_ir_code("keyboard-b-switch/2")
elif next_layout == 3:
    send_ir_code("multiviewer/2")
    send_ir_code("pc/display-half")
    send_ir_code("keyboard-b-switch/2")

# Save the current state
with open(state_path, "w") as f:
    json.dump({"last_layout": next_layout, "last_time": now}, f)