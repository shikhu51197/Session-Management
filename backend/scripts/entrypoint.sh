#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${BOOTSTRAP_MINIO:-true}" = "true" ]; then
  python manage.py bootstrap_minio
fi

exec "$@"
