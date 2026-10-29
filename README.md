# Ecommerce Demo

Tienda online argentina en un monorepo: API en Django, panel de administración y tienda en Next.js,
con facturación electrónica de ARCA (ex AFIP) y un asistente de IA en el panel.

- **Tienda** (`apps/web`): catálogo por categoría y marca, y página de producto.
- **Panel** (`apps/admin`): productos, marcas, categorías, clientes, pedidos y comprobantes.
- **Facturación**: Facturas A, B y C y sus notas de crédito y débito, emitidas con
  [arca-client](https://github.com/fzurs/arca-client), con CAE, PDF y código QR.
- **Asistente**: chat con Claude en el panel que consulta pedidos, productos, clientes y
  comprobantes (solo lectura).

## Stack

| | |
|---|---|
| API | Python 3.14, Django 5.2, Django REST Framework, PostgreSQL 18, Redis |
| Frontends | Next.js 16, React 19, TanStack Query/Table/Form, Tailwind, shadcn/ui (Base UI) |
| Cliente de la API | Generado desde OpenAPI con `@hey-api/openapi-ts` |
| Monorepo | pnpm + Turborepo, en un Dev Container |

```
apps/
  api/          # Django: store, orders, billing, assistant (puerto 8000)
  admin/        # Panel de administración (puerto 3001)
  web/          # Tienda (puerto 3000)
packages/
  api-client/   # Cliente de la API generado
  ui/           # Componentes de shadcn/ui
  data-table/   # Tablas compartidas
```

## Puesta en marcha

Requisitos: Docker y VS Code con la extensión Dev Containers.

```bash
git clone <repo-url> ecomm
code ecomm
```

En VS Code: **Dev Containers: Reopen in Container**. El contenedor trae Python, Node, Postgres y
Redis. Si clonás [arca-client](https://github.com/fzurs/arca-client) al lado de `ecomm`, se monta de
solo lectura en `/workspace/arca-client` para consultar su código.

Dentro del contenedor, desde la raíz:

```bash
cp apps/api/.env.example apps/api/.env
pnpm install
python apps/api/manage.py migrate
python apps/api/manage.py createsuperuser
python apps/api/manage.py seed                 # datos de prueba (opcional)
python apps/api/manage.py seed_conversations   # conversaciones del asistente (opcional)
pnpm dev
```

| App | URL |
|---|---|
| Tienda | http://localhost:3000 |
| Panel | http://localhost:3001 |
| API | http://localhost:8000 (admin de Django en `/admin/`) |

Los comprobantes del seed no pasan por ARCA y usan el punto de venta 99, así que no chocan con la
numeración real.

## Configuración

Las variables están documentadas en [`apps/api/.env.example`](apps/api/.env.example) y
[`apps/admin/.env.example`](apps/admin/.env.example).

- **ARCA**: generá el certificado con `arca-setup`, con carpeta base `apps/api/certs` y alias `ecomm`.
  En `apps/api/.env` van el ambiente (`homologacion` por defecto), el punto de venta, la condición
  del emisor y sus datos para el PDF. En homologación cada emisión consume numeración.
- **Asistente**: necesita `ANTHROPIC_API_KEY`.
- **Producción**: `config.settings.prod` (el default de `wsgi.py`) exige `SECRET_KEY`,
  `ALLOWED_HOSTS`, `ARCA_ENVIRONMENT` y las rutas del certificado de ARCA por entorno; ver la
  sección "Producción" de [`apps/api/.env.example`](apps/api/.env.example). Cuentas, 2FA,
  certificados y acceso a la base: [`docs/production.md`](docs/production.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta las tres apps (`pnpm --filter admin dev` para una sola) |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Lint, tipos y formato |
| `python apps/api/manage.py test <app>` | Tests de una app de la API |
| `python apps/api/manage.py seed --reset` | Recrea los datos de prueba |

Después de cambiar modelos, serializers o vistas, regenerá el cliente:

```bash
pnpm generate:schema && pnpm generate:api && pnpm typecheck
```

Los tests de la API usan un WSFE falso. `ARCAHomologacionTests` emite comprobantes reales en
homologación y solo corre con `ARCA_INTEGRATION_TESTS=1`.

Más detalles en [`CLAUDE.md`](CLAUDE.md), [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md) y
[`apps/admin/CLAUDE.md`](apps/admin/CLAUDE.md).
