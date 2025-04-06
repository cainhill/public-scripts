#!/bin/bash

# Script to set up Linux Mint with preferred settings

# --- Update and Upgrade System ---
echo "Updating and upgrading system..."
sudo apt update -y
sudo apt upgrade -y
sudo apt autoremove -y

# --- Install Essential Packages ---
echo "Installing essential packages..."
sudo apt install -y \
    gimp \
    inkscape \
    spotify-client \
    chromium-browser \
    brave-browser \
    firefox

# TODO: Add VLC
# TODO: Add xscreensaver + settings
# TODO: Download and set wallpaper
# TODO: Configure start menu
# TODO: Add apps to taskbar

# --- Configure Gnome Tweaks for Dark Mode ---
echo "Configuring Gnome Tweaks for Dark Mode..."
gsettings set org.gnome.desktop.interface gtk-theme 'Mint-Y-Dark'
gsettings set org.gnome.desktop.interface icon-theme 'Mint-Y-Dark'

# --- Final Message ---
echo "Setup complete! Please restart your terminal or log out and back in to apply changes."
