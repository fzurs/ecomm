#!/bin/bash
# The app's role and database, on the first start of an empty volume. The role isn't SUPERUSER:
# a superuser could disable the triggers that protect the invoices (docs/production.md).
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -v password="$ECOMM_DB_PASSWORD" <<'EOSQL'
CREATE ROLE ecomm LOGIN PASSWORD :'password';
CREATE DATABASE ecomm OWNER ecomm;
REVOKE ALL ON DATABASE ecomm FROM PUBLIC;
EOSQL
