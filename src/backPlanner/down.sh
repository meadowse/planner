#!/bin/bash
kill "$(cat /var/run/gunicorn/dev.pid)"