python ../../apps/api/manage.py spectacular --color --file schema.yml
pnpm exec openapi-zod-client ./schema.yml -o ./src/zodios/index.ts --export-schemas
