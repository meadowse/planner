#!/usr/bin/bash
sudo mkdir -pv /var/{log,run}/gunicorn/
sudo chown -cR meadowse:meadowse /var/{log,run}/gunicorn/
source ./.venv/bin/activate
echo "SECRET_KEY = '$(openssl rand -hex 40)'" > ./planner/DJANGO_SECRET_KEY.py
gunicorn -c ./config/gunicorn/dev.py
tail -f /var/log/gunicorn/dev.log