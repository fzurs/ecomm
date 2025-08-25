#!/bin/bash

TMPFILE=$(mktemp)

# require python enviroment
apps/api/manage.py spectacular --color --file "$TMPFILE"

pnpm exec openapi-generator-cli generate \
    -i "$TMPFILE" \
    -g typescript-axios \
    -o packages/sdks/typescript-axios

rm "$TMPFILE"