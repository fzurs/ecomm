#!/bin/bash
# Downloads a backup and decrypts it into /restore/ecomm.dump, for pg_restore
# (deploy/README.md). Needs the age private key mounted at /restore/key.txt.
#   restore.sh                  lists the backups
#   restore.sh <name>.dump.age  downloads and decrypts that one
set -euo pipefail

if [ $# -eq 0 ]; then
  rclone lsf "r2:$R2_BACKUP_BUCKET"
  exit
fi
rclone copyto "r2:$R2_BACKUP_BUCKET/$1" "/restore/$1"
age --decrypt --identity /restore/key.txt --output /restore/ecomm.dump "/restore/$1"
rm "/restore/$1"
echo "Decrypted to /restore/ecomm.dump"
