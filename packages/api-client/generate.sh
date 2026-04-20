# En el pasado usaba openapi-generator
# pnpm exec openapi-generator-cli generate -i schema.yml -g typescript-axios -o test

SCHEMA_FILE=$(mktemp)
python /workspaces/apps/api/manage.py spectacular --color --file "$SCHEMA_FILE"
pnpm exec openapi-zod-client "$SCHEMA_FILE" -o ./src/zodios/index.ts --export-schemas
rm "$SCHEMA_FILE"
