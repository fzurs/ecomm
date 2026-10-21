# ecomm

Monorepo pnpm + Turborepo: API REST en Django, dashboard de administración en Next.js y tienda en Next.js.
Corre dentro de un devcontainer (`.devcontainer/`): el contenedor `api` comparte la red de `db`, así que
Postgres y Redis (`redis://127.0.0.1:6379`) se acceden por localhost.

Responder en español. Código e identificadores en inglés, como el resto del repo.

## Estructura
- `apps/api` — Django 5.2 + DRF (apps `store`, `orders`, `billing`), puerto 8000. Ver `apps/api/CLAUDE.md`.
- `apps/admin` — dashboard de administración en Next.js 16, puerto 3001. Ver `apps/admin/CLAUDE.md`.
- `apps/web` — tienda en Next.js 16, puerto 3000. Fetch del lado del servidor con `"use cache"` en `src/lib/cache.ts`.
- `packages/api-client` — generado con `@hey-api/openapi-ts` (cliente axios + zod + TanStack Query).
  Exports: `@workspace/api-client` (sdk/tipos), `/query` (query options), `/zod` (schemas).
- `packages/ui` — shadcn/ui con estilo `base-vega` (Base UI, sin Radix; lucide). `packages/data-table` — componentes y hooks compartidos de TanStack Table.
  La skill `shadcn` (`.claude/skills/shadcn`, copia oficial de shadcn-ui/ui) usa el CLI: correrlo con
  `pnpm dlx shadcn@latest <cmd> -c packages/ui` (o `apps/admin` / `apps/web`); desde la raíz falla por ser monorepo.
  `add` escribe los componentes de UI en `packages/ui` según los aliases del `components.json`.
  Después de `add`, reemplazar `import { cn } from "cn"` por `@workspace/ui/lib/utils` y quitar la
  dependencia `cn` que agrega el CLI. Composición con `render={<Button />}`, no `asChild`.
  Links con estilo de botón: `<Link className={buttonVariants({...})}>`, no `<Button render={<Link />}>`
  (el `Button` de Base UI fuerza `role="button"`; así lo indica la doc de shadcn).
- `packages/{eslint,prettier,typescript}-config` — configuración compartida de herramientas.

## Comandos (desde la raíz)
- `pnpm dev` — todas las apps; `pnpm --filter admin dev` para una sola
- `pnpm lint`, `pnpm typecheck`, `pnpm format`
- `python apps/api/manage.py test [app]` — tests de la API
- `python apps/api/manage.py makemigrations` / `migrate`

## Flujo del contrato de la API (importante)
Todo cambio en models/serializers/views que afecte a la API tiene que seguirse de:
1. `pnpm generate:schema` — escribe `packages/api-client/schema.yml` (en .gitignore)
2. `pnpm generate:api` — regenera `packages/api-client/src/**` (se commitea)
3. `pnpm typecheck` — corregir lo que se rompa en admin/web

Nunca editar a mano `packages/api-client/src/**/*.gen.ts`. La skill `/regen-api` corre este flujo.

## Secretos y datos personales
- `apps/api/*.pem` (certificado/clave de ARCA), `apps/api/.env`, `db.env` y `apps/api/media/` son
  solo locales. Nunca commitearlos ni mostrar su contenido.
- Nunca poner CUIT/CAE reales en código ni en tests; usar valores ficticios (ej. CUIT `20123456786`).

## ARCA (facturación)
- `arca-client` es un paquete externo fijado por commit en `apps/api/requirements.txt`. Su código
  está en `/workspace/arca-client` con su propio CLAUDE.md: leerlo para entender la API, pero no
  editar ese repo desde acá.
- Homologación no es gratis: cada comprobante emitido consume numeración. No correr tests con
  `ARCA_INTEGRATION_TESTS=1` ni emitir facturas contra ARCA sin preguntar antes.

## Git
- Conventional Commits con scope, mensajes en español:
  `refactor(admin): ...`, `fix(billing): ...`, `feat(api): ...`.
- El trabajo diario va en `claude/desarrollo`. Commitear o pushear solo cuando se pide.
