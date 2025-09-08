#!/bin/bash

TMPFILE=$(mktemp --suffix=.yml)

# require python enviroment
./apps/api/manage.py spectacular --color --file "$TMPFILE"

pnpm exec openapi-generator-cli generate \
    -i "$TMPFILE" \
    -g typescript-axios \
    -o packages/api-client-v1 \
    --additional-properties=\
useSingleRequestParameter=true,\
withInterfaces=true,\
npmName=@workspace/api-client-v1

rm "$TMPFILE"