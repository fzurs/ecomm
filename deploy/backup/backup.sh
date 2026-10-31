#!/bin/bash
# The database's dump, encrypted with the age public key and uploaded to the backups bucket.
# Only the private key, kept off the server, opens it (restore.sh). The bucket's lifecycle rule
# deletes the old ones.
set -euo pipefail

name="ecomm-$(date -u +%Y%m%dT%H%M%SZ).dump.age"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

pg_dump --host db --username ecomm --format custom --file "$work/ecomm.dump" ecomm
age --recipient "$AGE_RECIPIENT" --output "$work/$name" "$work/ecomm.dump"
rclone copyto "$work/$name" "r2:$R2_BACKUP_BUCKET/$name"
echo "Backup uploaded: $name"
