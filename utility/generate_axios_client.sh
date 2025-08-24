#!/bin/bash

# Crear archivo temporal
TMPFILE=$(mktemp)

# Generar el schema en el archivo temporal
./manage.py spectacular --color --file "$TMPFILE"

# Usar el archivo temporal con openapi-generator
pnpm exec openapi-generator-cli generate -i "$TMPFILE" -g typescript-axios -o frontend/lib/axios-client/

# Eliminar el archivo temporal
rm "$TMPFILE"
