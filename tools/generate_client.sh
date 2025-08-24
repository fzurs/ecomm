#!/bin/bash
TMPFILE=$(mktemp)

apps/api/manage.py spectacular --color --file schema.yml

pnpm exec openapi-generator-cli generate \
    -i "TMPFILE" \
    -g typescript-axios \
    -o packages/sdk/

rm "$TMPFILE"