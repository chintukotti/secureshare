#!/usr/bin/env bash
set -euo pipefail

cd /home/ec2-user/secureshare-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

sudo touch /var/log/secureshare-backend.log
sudo chown ec2-user:ec2-user /var/log/secureshare-backend.log
sudo cp scripts/secureshare-backend.service /etc/systemd/system/secureshare-backend.service
sudo systemctl daemon-reload
sudo systemctl enable secureshare-backend
sudo systemctl restart secureshare-backend
sudo systemctl status secureshare-backend --no-pager
