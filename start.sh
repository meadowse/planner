#!/usr/bin/bash
sudo mkdir -pv /var/{log,run}/gunicorn/planner/
sudo chown -cR meadowse:meadowse /var/{log,run}/gunicorn/planner/
source venv/bin/activate
source /home/meadowse/.DJANGO_SECRET_KEY_PLANNER
gunicorn -c config/gunicorn/dev.py
tail -f /var/log/gunicorn/planner/dev.log