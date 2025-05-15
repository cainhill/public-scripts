#!/bin/bash

# TODO: Install Portainer using CachyOS Installer

sudo systemctl enable docker

sudo systemctl start docker

sudo systemctl status docker

sudo docker volume create portainer_data

sudo docker run -d -p 8000:8000 -p 9443:9443 – portainer –restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ee:lts