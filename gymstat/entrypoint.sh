#!/bin/bash
set -e

mkdir -p /run/uwsgi
chown www-data:www-data /run/uwsgi
exec "$@"