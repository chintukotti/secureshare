#!/usr/bin/env bash
set -euo pipefail

sudo dnf update -y
sudo dnf install -y python3.13 python3.13-pip git

cd /home/ec2-user
if [ ! -d secureshare-backend ]; then
  echo "Upload or git clone secureshare-backend here before running app setup."
fi
