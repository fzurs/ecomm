#!/bin/bash
# Deploys main on the server (deploy/README.md): pulls, builds the images, migrates, checks the
# settings and restarts what changed, waiting for the healthchecks.
set -euo pipefail
cd "$(dirname "$0")/.."

compose() { docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env "$@"; }

git pull --ff-only
compose build
compose up -d --wait db redis
# Also writes the triggers that protect the invoices and syncs the roles (accounts/roles.py).
compose run --rm --no-deps api python manage.py migrate --noinput
compose run --rm --no-deps api python manage.py check --deploy --fail-level WARNING
compose up -d --wait --remove-orphans
compose ps
