#!/bin/bash
./manage.py spectacular --color --file schema.yml 
cd frontend
openapi-generator-cli generate -i ../schema.yml -g typescript-axios -o lib/api/