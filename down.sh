#!/bin/bash
sudo kill $(cat "/var/run/gunicorn/planner/dev.pid")