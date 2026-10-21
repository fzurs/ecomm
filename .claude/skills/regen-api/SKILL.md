---
name: regen-api
description: Regenera el schema OpenAPI y packages/api-client después de cambiar models, serializers o views de Django, y corre el typecheck de los frontends. Usar siempre que cambie el contrato de la API.
---

# Regenerar el cliente de la API

Correr desde la raíz del repo (`/workspace/ecomm`), frenando en el primer error:

1. `python apps/api/manage.py check` — detectar errores de Django antes de generar.
2. `pnpm generate:schema` — escribe `packages/api-client/schema.yml`. Informar los warnings de
   drf-spectacular (enums sin nombre, falta de `operation_id`, serializers adivinados): suelen
   indicar que la view necesita `@extend_schema` o una entrada en `ENUM_NAME_OVERRIDES`.
3. `pnpm generate:api` — regenera `packages/api-client/src/**`.
4. `pnpm typecheck` — los errores de tipos en `apps/admin` o `apps/web` suelen ser operaciones
   renombradas o con otra forma.

Después resumir:
- `git diff --stat packages/api-client` y qué operaciones/tipos se agregaron, borraron o renombraron.
- Cada error de tipos con el archivo y el arreglo probable. Arreglarlos solo si el usuario lo pidió.

Nunca editar a mano los `*.gen.ts` generados para que pase el typecheck; corregir el lado de
Django y regenerar.
