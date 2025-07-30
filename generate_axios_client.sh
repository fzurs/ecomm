#!/bin/bash
./manage.py spectacular --color --file schema.yml 
openapi-generator-cli generate -i schema.yml -g typescript-axios -o frontend/lib/api/
rm schema.yml